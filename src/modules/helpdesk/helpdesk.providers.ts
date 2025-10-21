import { DataSource } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketResponse } from './entities/ticket-response.entity';

export const helpdeskProviders = [
  {
    provide: 'TICKET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Ticket),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'TICKET_RESPONSE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TicketResponse),
    inject: ['DATA_SOURCE'],
  },
];
