import { Test } from '@nestjs/testing';
import { DatabaseModule } from 'shared/database/database.module';
import { ReservationItem } from './reservation-item.entity';
import { ReservationOverlapException } from '../exceptions/reservation-overlap.exception';
import { Reservation } from './reservation.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { addMinutes, subMinutes } from 'date-fns';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';

const USER_ID = 1;

describe('ReservationItem entity', () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [databaseConfig] }),
        DatabaseModule.forRoot({
          debug: false,
          connect: false,
        }),
        MikroOrmModule.forFeature([ReservationItem, Reservation]),
      ],
    }).compile();
  });

  it('reservation should be created if there are no other reservations', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    expect(reservationItem.reservations.length).toBe(1);
  });

  it('createReservation should fail if startDate is between existing reservation startDate and endDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = addMinutes(startDate, 7);
    const endDate2 = addMinutes(startDate, 20);
    const action = () => {
      reservationItem.createReservation(startDate2, endDate2, USER_ID);
    };
    expect(action).toThrow(ReservationOverlapException);
  });

  it('createReservation should create reservation if startDate is equal to existing reservation endDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = endDate;
    const endDate2 = addMinutes(startDate, 20);
    reservationItem.createReservation(startDate2, endDate2, USER_ID);
    expect(reservationItem.reservations.length).toBe(2);
  });

  it('createReservation should fail if endDate is between existing reservation startDate and endDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = subMinutes(startDate, 10);
    const endDate2 = addMinutes(startDate, 10);
    const action = () => {
      reservationItem.createReservation(startDate2, endDate2, USER_ID);
    };
    expect(action).toThrow(ReservationOverlapException);
  });

  it('createReservation should create reservation if endDate is equal to existing reservation startDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = subMinutes(startDate, 10);
    const endDate2 = startDate;
    reservationItem.createReservation(startDate2, endDate2, USER_ID);
    expect(reservationItem.reservations.length).toBe(2);
  });

  it('createReservation should fail if startDate and endDate are between existing reservation startDate and endDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = addMinutes(startDate, 5);
    const endDate2 = addMinutes(startDate, 10);
    const action = () => {
      reservationItem.createReservation(startDate2, endDate2, USER_ID);
    };
    expect(action).toThrow(ReservationOverlapException);
  });

  it('createReservation should fail if startDate is equal to existing reservation startDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = startDate;
    const endDate2 = addMinutes(startDate2, 20);
    const action = () => {
      reservationItem.createReservation(startDate2, endDate2, USER_ID);
    };
    expect(action).toThrow(ReservationOverlapException);
  });

  it('createReservation should fail if startDate is before existing reservation startDate but endDate is after existing reservation endDate', () => {
    const reservationItem = new ReservationItem();
    const startDate = new Date();
    const endDate = addMinutes(startDate, 15);
    reservationItem.createReservation(startDate, endDate, USER_ID);
    const startDate2 = subMinutes(startDate, 10);
    const endDate2 = addMinutes(startDate, 20);
    const action = () => {
      reservationItem.createReservation(startDate2, endDate2, USER_ID);
    };
    expect(action).toThrow(ReservationOverlapException);
  });
});
