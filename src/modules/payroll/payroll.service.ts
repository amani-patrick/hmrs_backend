// src/modules/payroll/payroll.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PayrollRecord } from './entities/payroll-record.entity';
import { BenefitsPlan } from './entities/benefits-plan.entity';
import { SalaryGrade } from './entities/salary-grade.entity';
import { IremboPayClient } from './irembo-pay/irembo-pay.client';
import { IremboPaymentRequest } from './irembo-pay/irembo-pay.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PayrollService {
  constructor(
    @Inject('PAYROLL_RECORD_REPOSITORY')
    private readonly payrollRecordRepository: Repository<PayrollRecord>,
    @Inject('BENEFITS_PLAN_REPOSITORY')
    private readonly benefitsPlanRepository: Repository<BenefitsPlan>,
    @Inject('SALARY_GRADE_REPOSITORY')
    private readonly salaryGradeRepository: Repository<SalaryGrade>,
    private readonly iremboPayClient: IremboPayClient,
  ) {}

  async getOverviewStats() {
    const monthlyPayrollResult = await this.payrollRecordRepository
      .createQueryBuilder('record')
      .getRawOne();
      
    const employeesProcessed = await this.payrollRecordRepository.count({ 
      where: { paymentStatus: 'Processed' } 
    });

    return {
      monthlyPayroll: monthlyPayrollResult.monthlyPayroll || 0,
      employeesProcessed,
      averageSalary: 850000,
      upcomingDate: '2025-11-25',
    };
  }

  async processMonthlyPayroll(tenantId: string): Promise<string> {
    // Mock employee records
    const mockEmployeeRecords = [
      { userId: uuid(), grossSalary: 1000000, netAmount: 850000, recipientAccount: '0788123456' },
      { userId: uuid(), grossSalary: 1500000, netAmount: 1275000, recipientAccount: '0788765432' },
    ];
    
    const totalNetPay = mockEmployeeRecords.reduce((sum, r) => sum + r.netAmount, 0);

    // Generate batch invoice
    const { billId } = await this.iremboPayClient.generateBatchInvoice(
      totalNetPay, 
      `Monthly Payroll for ${tenantId}`
    );

    // Process each payment
    for (const recordData of mockEmployeeRecords) {
      const paymentRequest: IremboPaymentRequest = {
        billId,
        amount: recordData.netAmount,
        currency: 'RWF',
        recipientAccount: recordData.recipientAccount,
        description: 'Monthly Salary Disbursement',
      };

      const paymentResponse = await this.iremboPayClient.initiatePayment(paymentRequest);
      
      // Save the payroll record
      const record = this.payrollRecordRepository.create({
        ...recordData,
        payDate: new Date(),
        paymentStatus: paymentResponse.status,
        taxDeductions: recordData.grossSalary - recordData.netAmount,
        benefitsDeductions: 0,
        iremboPayBillId: billId,
        breakdown: {
          basicSalary: recordData.grossSalary * 0.8,
          allowances: { housing: recordData.grossSalary * 0.2 },
          deductions: { tax: recordData.grossSalary * 0.15 },
          benefits: {},
        },
      });
      
      await this.payrollRecordRepository.save(record);
    }

    return billId;
  }

  async getBenefitsStats() {
    const activePlans = await this.benefitsPlanRepository.count();
    const totalCost = await this.benefitsPlanRepository
      .createQueryBuilder('plan')
      .select('SUM(plan.totalMonthlyCost)', 'cost')
      .getRawOne();
      
    return { 
      activePlans, 
      totalMonthlyCost: totalCost.cost || 0, 
      participateRate: '85%' 
    };
  }
}