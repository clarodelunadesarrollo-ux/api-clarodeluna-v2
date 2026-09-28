import { InvalidScheduleException } from '../exceptions/invalid-schedule.exception';
import { ScheduleWindow } from './schedule-window.vo';

describe('ScheduleWindow', () => {
  describe('create', () => {
    it('rejects a malformed time', () => {
      expect(() => ScheduleWindow.create('9:00', '18:00', 60)).toThrow(
        InvalidScheduleException,
      );
    });

    it('rejects openTime equal to or after closeTime', () => {
      expect(() => ScheduleWindow.create('18:00', '18:00', 60)).toThrow(
        InvalidScheduleException,
      );
      expect(() => ScheduleWindow.create('19:00', '18:00', 60)).toThrow(
        InvalidScheduleException,
      );
    });

    it('rejects a non-positive interval', () => {
      expect(() => ScheduleWindow.create('10:00', '18:00', 0)).toThrow(
        InvalidScheduleException,
      );
    });

    it('rejects an interval larger than the window', () => {
      expect(() => ScheduleWindow.create('10:00', '11:00', 120)).toThrow(
        InvalidScheduleException,
      );
    });
  });

  describe('generateSlots', () => {
    it('generates open, open+interval, ... strictly before close', () => {
      const window = ScheduleWindow.create('10:00', '12:00', 30);
      expect(window.generateSlots()).toEqual([
        '10:00',
        '10:30',
        '11:00',
        '11:30',
      ]);
    });

    it('never includes the closing time', () => {
      const window = ScheduleWindow.create('10:00', '11:00', 60);
      expect(window.generateSlots()).toEqual(['10:00']);
    });
  });

  describe('includes', () => {
    const window = ScheduleWindow.create('12:00', '23:00', 30);

    it('accepts a time on an interval boundary inside the window', () => {
      expect(window.includes('12:00')).toBe(true);
      expect(window.includes('22:30')).toBe(true);
    });

    it('rejects the closing time and out-of-boundary times', () => {
      expect(window.includes('23:00')).toBe(false);
      expect(window.includes('12:15')).toBe(false);
      expect(window.includes('11:30')).toBe(false);
    });
  });
});
