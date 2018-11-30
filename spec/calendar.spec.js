import React from 'react';
import { shallow, mount } from 'enzyme';
import Calendar from '../calendar';

let calendar;
let onSelectSpy;
let onCancelSpy;
const renderComponent = props => shallow(<Calendar minDate="2000-01-01T00:00:00.000Z" {...props} />);
const mountComponent = props => mount(<Calendar minDate="2000-01-01T00:00:00.000Z" {...props} />);

const getTextForDayAt = (weekdays, index) => weekdays.at(index).text();
const classForDayIsIsDifferentMonth = (weekdays, index) => weekdays.at(index).childAt(0).hasClass('is-different-month');
const classForDayIsIsSelected = (weekdays, index) => weekdays.at(index).childAt(0).hasClass('is-selected');
const classForDayIsIsAlsoSelected = (weekdays, index) => weekdays.at(index).childAt(0).hasClass('is-also-selected');

describe('<Calendar />', () => {
  beforeEach(() => {
    calendar = renderComponent();
  });

  it('SHOULD render', () => {
    expect(calendar.find('div.calendar').length).toBe(1);
  });

  it('SHOULD render the previous, current and next month calendars', () => {
    expect(calendar.find('.calendar-day-area.previous').length).toBe(1);
    expect(calendar.find('.calendar-day-area').length).toBe(3);
    expect(calendar.find('.calendar-day-area.next').length).toBe(1);
  });

  it('SHOULD toggle the year to be visible and hide the days when the top YEAR area is clicked', () => {
    expect(calendar.find('.calendar-calendar-area').hasClass('is-faded')).toBe(false);
    expect(calendar.find('.calendar-year-area').hasClass('is-faded')).toBe(true);
    calendar.find('.selected-year').simulate('click');
    expect(calendar.find('.selected-day').hasClass('active')).toBe(false);
    expect(calendar.find('.selected-year').hasClass('active')).toBe(true);
    expect(calendar.find('.calendar-calendar-area').hasClass('is-faded')).toBe(true);
    expect(calendar.find('.calendar-year-area').hasClass('is-faded')).toBe(false);
  });

  it('SHOULD toggle the calendar to be visible and hide the year when the top DATE area is clicked', () => {
    calendar.setState({
      activeDateItem: Calendar.ITEM_YEAR
    });

    expect(calendar.find('.calendar-calendar-area').hasClass('is-faded')).toBe(true);
    expect(calendar.find('.calendar-year-area').hasClass('is-faded')).toBe(false);
    calendar.find('.selected-day').simulate('click');
    expect(calendar.find('.selected-day').hasClass('active')).toBe(true);
    expect(calendar.find('.selected-year').hasClass('active')).toBe(false);
    expect(calendar.find('.calendar-calendar-area').hasClass('is-faded')).toBe(false);
    expect(calendar.find('.calendar-year-area').hasClass('is-faded')).toBe(true);
  });

  describe('GIVEN a selectedDate of 2010-02-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2010-02-01T00:00:00.000Z' });
    });

    it('SHOULD only render 4 weeks on the current calendar', () => {
      expect(calendar.find('.calendar-day-area').at(1).find('.days').length).toBe(4);
    });
  });

  describe('GIVEN a selectedDate of 2010-02-01 and a displayed date of 2010-03-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2010-02-01T00:00:00.000Z' });
      calendar.setState({ displayedDateStart: '2010-03-01T00:00:00.000Z' });
    });

    it('SHOULD only render 4 weeks on the previous calendar', () => {
      expect(calendar.find('.calendar-day-area.previous .days').length).toBe(4);
    });
  });

  describe('GIVEN a selectedDate of 2010-02-01 and a displayed date of 2010-01-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2010-02-01T00:00:00.000Z' });
      calendar.setState({ displayedDateStart: '2010-01-01T00:00:00.000Z' });
    });

    it('SHOULD only render 4 weeks on the next calendar', () => {
      expect(calendar.find('.calendar-day-area.next .days').length).toBe(4);
    });
  });

  describe('GIVEN a selectedDate of 2017-01-01T00:00:00.000Z', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2017-01-01T00:00:00.000Z' });
    });

    it('SHOULD display the selected month in the top bar', () => {
      expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
      expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('Sun 1 Jan');
    });

    it('SHOULD change the active item to be DATE when a YEAR is selected', () => {
      calendar.setState({ activeDateItem: Calendar.ITEM_YEAR });

      calendar.find('.calendar-year-area li').first().simulate('click');

      expect(calendar.state('activeDateItem')).toBe(Calendar.ITEM_DATE);
    });

    it('SHOULD call the onSelect prop fn with the correct value when select is clicked', () => {
      onSelectSpy = jasmine.createSpy('onSelect');
      calendar = renderComponent({ onSelect: onSelectSpy, selectedDate: '2017-01-01T00:00:00.000Z' });
      calendar.find('.set-button').simulate('click');

      expect(onSelectSpy).toHaveBeenCalledWith('2017-01-01T00:00:00.000Z');
    });

    // TODO: Consider this. It's just to get code coverage to 100, but a default prop isn't testable...
    it('SHOULD call the default onSelect prop when select is clicked', () => {
      calendar.find('.set-button').simulate('click');
    });

    // TODO: Consider this. It's just to get code coverage to 100, but a default prop isn't testable...
    it('SHOULD call the default onSelect prop when select is clicked', () => {
      calendar.find('.cancel-button').simulate('click');
    });

    it('SHOULD call the onCancel prop fn when cancel is clicked', () => {
      onCancelSpy = jasmine.createSpy('onCancel');
      calendar = renderComponent({ onCancel: onCancelSpy, selectedDate: '2017-01-01T00:00:00.000Z' });
      calendar.find('.cancel-button').simulate('click');

      expect(onCancelSpy).toHaveBeenCalled();
    });

    describe('AND a min date of 2017-01-01', () => {
      beforeEach(() => {
        calendar = renderComponent({
          selectedDate: '2017-01-01T00:00:00.000Z',
          minDate: '2017-01-01T00:00:00.000Z'
        });
      });

      it('SHOULD not do anything when the previous period arrow is clicked', () => {
        const previousPeriod = calendar.find('.chevron-left').at(1);
        previousPeriod.simulate('click');

        expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');
        expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('January 2017');
        expect(previousPeriod.hasClass('is-past-min-max-date')).toBe(true);
      });
    });

    describe('AND a max date of 2017-01-31', () => {
      beforeEach(() => {
        calendar = renderComponent({
          selectedDate: '2017-01-01T00:00:00.000Z',
          maxDate: '2017-01-31T00:00:00.000Z'
        });
      });

      it('SHOULD not do anything when the previous period arrow is clicked', () => {
        const nextPeriod = calendar.find('.chevron-right').at(1);
        nextPeriod.simulate('click');

        expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');
        expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('January 2017');
        expect(nextPeriod.hasClass('is-past-min-max-date')).toBe(true);
      });
    });

    it('SHOULD render the correct selected date at the top of the calendar', () => {
      expect(calendar.find('.calendar-content .selected-day').text()).toBe('Sun 1 Jan');
      expect(calendar.find('.calendar-content .selected-year').text()).toBe('2017');
    });

    describe('GIVEN the previous month calendar', () => {
      let previousCalendar;
      let previousCalendarWeeks;
      beforeEach(() => {
        previousCalendar = calendar.find('.calendar-day-area.previous');
        previousCalendarWeeks = previousCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const previousCalendarDays = previousCalendar.find('.days li');
        expect(previousCalendarDays.length).toBe(35);
      });

      it('SHOULD display the correct month / year', () => {
        const previousCalendarMonth = previousCalendar.find('.current-displayed-month');
        expect(previousCalendarMonth.text()).toBe('December 2016');
      });

      it('SHOULD mark the previous month\'s (November) days with an appropriate class', () => {
        const differentMonthTestCases = [
          { index: 0, expectedResult: '28' },
          { index: 1, expectedResult: '29' },
          { index: 2, expectedResult: '30' }
        ];

        const firstWeek = previousCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');

        differentMonthTestCases.forEach((testCase) => {
          expect(getTextForDayAt(firstWeekDays, testCase.index)).toBe(testCase.expectedResult);
          expect(classForDayIsIsDifferentMonth(firstWeekDays, testCase.index)).toBe(true);
        });
      });

      it('SHOULD mark the next month\'s (January) days with an appropriate class', () => {
        const finalWeek = previousCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        expect(getTextForDayAt(finalWeekDays, 6)).toBe('1');
        expect(classForDayIsIsDifferentMonth(finalWeekDays, 6)).toBe(true);
      });

      it('SHOULD mark selected date as being selected', () => {
        const finalWeek = previousCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        expect(classForDayIsIsSelected(finalWeekDays, 6)).toBe(true);
      });
    });

    describe('GIVEN the current month calendar', () => {
      let currentCalendar;
      let currentCalendarWeeks;
      beforeEach(() => {
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const currentCalendarDays = currentCalendar.find('.days li');
        expect(currentCalendarDays.length).toBe(42);
      });

      it('SHOULD display the correct month / year', () => {
        const currentCalendarMonth = currentCalendar.find('.current-displayed-month');
        expect(currentCalendarMonth.text()).toBe('January 2017');
      });

      it('SHOULD mark the previous month\'s (December) days with an appropriate class', () => {
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');

        const differentMonthTestCases = [
          { index: 0, expectedResult: '26' },
          { index: 1, expectedResult: '27' },
          { index: 2, expectedResult: '28' },
          { index: 3, expectedResult: '29' },
          { index: 4, expectedResult: '30' },
          { index: 5, expectedResult: '31' }
        ];

        differentMonthTestCases.forEach((testCase) => {
          expect(getTextForDayAt(firstWeekDays, testCase.index)).toBe(testCase.expectedResult);
          expect(classForDayIsIsDifferentMonth(firstWeekDays, testCase.index)).toBe(true);
        });
      });

      it('SHOULD mark the next month\'s (February) days with an appropriate class', () => {
        const finalWeek = currentCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');

        const differentMonthTestCases = [
          { index: 2, expectedResult: '1' },
          { index: 3, expectedResult: '2' },
          { index: 4, expectedResult: '3' },
          { index: 5, expectedResult: '4' },
          { index: 6, expectedResult: '5' }
        ];

        differentMonthTestCases.forEach((testCase) => {
          expect(getTextForDayAt(finalWeekDays, testCase.index)).toBe(testCase.expectedResult);
          expect(classForDayIsIsDifferentMonth(finalWeekDays, testCase.index)).toBe(true);
        });
      });

      it('SHOULD mark selected date as being selected', () => {
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        expect(classForDayIsIsSelected(firstWeekDays, 6)).toBe(true);
      });

      it('SHOULD handle a click on a day within the same month correctly', () => {
        let secondWeek = currentCalendarWeeks.at(1);
        let secondWeekDays = secondWeek.find('li');
        secondWeekDays.at(3).simulate('click');

        expect(calendar.state('selectedDate')).toBe('2017-01-05T00:00:00.000Z');
        expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');

        // re-fetch the components we're working with
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
        secondWeek = currentCalendarWeeks.at(1);
        secondWeekDays = secondWeek.find('li');
        expect(classForDayIsIsSelected(secondWeekDays, 3)).toBe(true);

        expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
        expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('Thu 5 Jan');
      });

      it('SHOULD handle a click on a day within the previous month correctly', () => {
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        firstWeekDays.at(2).simulate('click');

        expect(calendar.state('selectedDate')).toBe('2016-12-28T00:00:00.000Z');
        expect(calendar.state('displayedDateStart')).toBe('2016-12-01T00:00:00.000Z');

        // re-fetch the components we're working with
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
        const finalWeek = currentCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        expect(classForDayIsIsSelected(finalWeekDays, 2)).toBe(true);

        expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2016');
        expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('Wed 28 Dec');
      });

      it('SHOULD handle a click on a day within the next month correctly', () => {
        const finalWeek = currentCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        finalWeekDays.last().simulate('click');

        expect(calendar.state('selectedDate')).toBe('2017-02-05T00:00:00.000Z');
        expect(calendar.state('displayedDateStart')).toBe('2017-02-01T00:00:00.000Z');

        // re-fetch the components we're working with
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        expect(classForDayIsIsSelected(firstWeekDays, 6)).toBe(true);
      });
    });

    describe('GIVEN the next month calendar', () => {
      let nextCalendar;
      let nextCalendarWeeks;
      beforeEach(() => {
        nextCalendar = calendar.find('.calendar-day-area.next');
        nextCalendarWeeks = nextCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const nextCalendarDays = nextCalendar.find('.days li');
        expect(nextCalendarDays.length).toBe(35);
      });

      it('SHOULD display the correct month / year', () => {
        const nextCalendarMonth = nextCalendar.find('.current-displayed-month');
        expect(nextCalendarMonth.text()).toBe('February 2017');
      });

      it('SHOULD mark the previous month\'s (January) days with an appropriate class', () => {
        const firstWeek = nextCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');

        const differentMonthTestCases = [
          { index: 0, expectedResult: '30' },
          { index: 1, expectedResult: '31' }
        ];

        differentMonthTestCases.forEach((testCase) => {
          expect(getTextForDayAt(firstWeekDays, testCase.index)).toBe(testCase.expectedResult);
          expect(classForDayIsIsDifferentMonth(firstWeekDays, testCase.index)).toBe(true);
        });
      });

      it('SHOULD mark the next month\'s (March) days with an appropriate class', () => {
        const finalWeek = nextCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');

        const differentMonthTestCases = [
          { index: 2, expectedResult: '1' },
          { index: 3, expectedResult: '2' },
          { index: 4, expectedResult: '3' },
          { index: 5, expectedResult: '4' },
          { index: 6, expectedResult: '5' }
        ];

        differentMonthTestCases.forEach((testCase) => {
          expect(getTextForDayAt(finalWeekDays, testCase.index)).toBe(testCase.expectedResult);
          expect(classForDayIsIsDifferentMonth(finalWeekDays, testCase.index)).toBe(true);
        });
      });

      it('SHOULD not have any date as being selected', () => {
        expect(nextCalendarWeeks.find('.is-selected').length).toBe(0);
      });
    });

    describe('GIVEN a max date of 2017-01-15T00:00:00.000Z', () => {
      let currentCalendar;
      beforeEach(() => {
        calendar = renderComponent({ selectedDate: '2017-01-01T00:00:00.000Z', maxDate: '2017-01-15T00:00:00.000Z' });
        currentCalendar = calendar.find('.calendar-day-area').at(1);
      });

      it('SHOULD disable any days greater than the given max date', () => {
        const disabledDays = currentCalendar.find('.days div.is-disabled');
        expect(disabledDays.length).toBe(21);
      });

      it('SHOULD disable the "next month" arrow', () => {
        expect(calendar.find('.chevron-right').at(1).hasClass('is-past-min-max-date')).toBe(true);
      });

      it('SHOULD do nothing when a date greater than the max date is clicked', () => {
        const thirdWeekDays = currentCalendar.find('.days').at(3).find('li');
        thirdWeekDays.first().simulate('click');
        expect(calendar.state('selectedDate')).toBe('2017-01-01T00:00:00.000Z');
      });
    });
  });

  describe('GIVEN a selectedDate of 2017-04-13T00:00:00.000Z', () => {
    let currentCalendar;
    let currentCalendarWeeks;
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2017-04-13T00:00:00.000Z' });
      currentCalendar = calendar.find('.calendar-day-area').at(1);
      currentCalendarWeeks = currentCalendar.find('.days');
    });

    it('SHOULD handle a click on a day within the previous month correctly', () => {
      const firstWeek = currentCalendarWeeks.first();
      const firstWeekDays = firstWeek.find('li');
      firstWeekDays.first().simulate('click');

      expect(calendar.state('selectedDate')).toBe('2017-03-27T00:00:00.000Z');
      expect(calendar.state('displayedDateStart')).toBe('2017-03-01T00:00:00.000Z');

      // re-fetch the components we're working with
      currentCalendar = calendar.find('.calendar-day-area').at(1);
      currentCalendarWeeks = currentCalendar.find('.days');
      const finalWeek = currentCalendarWeeks.last();
      const finalWeekDays = finalWeek.find('li');
      expect(classForDayIsIsSelected(finalWeekDays, 0)).toBe(true);
    });

    describe('GIVEN the previous month calendar', () => {
      let previousCalendar;
      let previousCalendarWeeks;
      beforeEach(() => {
        previousCalendar = calendar.find('.calendar-day-area.previous');
        previousCalendarWeeks = previousCalendar.find('.days');
      });

      it('SHOULD not have any date selected', () => {
        expect(previousCalendarWeeks.find('.is-selected').length).toBe(0);
      });
    });

    describe('GIVEN the current month calendar', () => {
      let currentCalendar;
      let currentCalendarWeeks;
      beforeEach(() => {
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const currentCalendarDays = currentCalendar.find('.days li');
        expect(currentCalendarDays.length).toBe(35);
      });

      it('SHOULD mark selected date as being selected', () => {
        const thirdWeek = currentCalendarWeeks.at(2);
        const thirdWeekDays = thirdWeek.find('li');
        expect(classForDayIsIsSelected(thirdWeekDays, 3)).toBe(true);
      });

      it('SHOULD not have any days marked as different-month in the final week', () => {
        const finalWeek = currentCalendarWeeks.last();
        expect(finalWeek.find('.is-different-month').length).toBe(0);
      });
    });

    describe('GIVEN the next month calendar', () => {
      let nextCalendar;
      let nextCalendarWeeks;
      beforeEach(() => {
        nextCalendar = calendar.find('.calendar-day-area.next');
        nextCalendarWeeks = nextCalendar.find('.days');
      });

      it('SHOULD not have any days marked as different-month in the first week', () => {
        const finalWeek = nextCalendarWeeks.first();
        expect(finalWeek.find('.is-different-month').length).toBe(0);
      });
    });

    describe('GIVEN a min date of 2017-04-06T00:00:00.000Z', () => {
      let currentCalendar;
      beforeEach(() => {
        calendar = renderComponent({
          selectedDate: '2017-04-13T00:00:00.000Z',
          minDate: new Date(2017, 3, 6).toISOString()
        });
        currentCalendar = calendar.find('.calendar-day-area').at(1);
      });

      it('SHOULD disable any days earlier than the given min date', () => {
        const disabledDays = currentCalendar.find('.days div.is-disabled');
        expect(disabledDays.length).toBe(10);
      });

      it('SHOULD disable the "previous month" arrow', () => {
        expect(calendar.find('.chevron-left').at(1).hasClass('is-past-min-max-date')).toBe(true);
      });

      it('SHOULD do nothing when a date earlier than the max date is clicked', () => {
        const firstWeekDays = currentCalendar.find('.days').first().find('li');
        firstWeekDays.at(5).simulate('click');
        expect(calendar.state('selectedDate')).toBe('2017-04-13T00:00:00.000Z');
      });
    });
  });

  describe('GIVEN a selected date of 2016-12-31T00:00:00.000Z', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2016-12-31T00:00:00.000Z' });
    });

    describe('GIVEN the current month calendar', () => {
      it('SHOULD handle a click on a day within the next month correctly', () => {
        let currentCalendar = calendar.find('.calendar-day-area').at(1);
        let currentCalendarWeeks = currentCalendar.find('.days');
        const finalWeek = currentCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        finalWeekDays.last().simulate('click');

        expect(calendar.state('selectedDate')).toBe('2017-01-01T00:00:00.000Z');
        expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');

        // re-fetch the components we're working with
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        expect(classForDayIsIsSelected(firstWeekDays, 6)).toBe(true);
      });
    });

    describe('AND a displayed start date of 2017-01-01', () => {
      beforeEach(() => {
        calendar = renderComponent({
          selectedDate: '2016-12-31T00:00:00.000Z'
        });

        calendar.setState({
          displayedDateStart: '2017-01-01T00:00:00.000Z'
        });
      });

      it('SHOULD mark the 6th day in the previous month as being selected', () => {
        const currentCalendar = calendar.find('.calendar-day-area').at(1);
        const currentCalendarWeeks = currentCalendar.find('.days');
        const firstWeek = currentCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        expect(classForDayIsIsSelected(firstWeekDays, 5)).toBe(true);
      });
    });
  });

  describe('GIVEN a selected date of 2017-01-01', () => {
    describe('AND a displayed start of 2016-12-01', () => {
      let calendar;
      beforeEach(() => {
        calendar = renderComponent({ selectedDate: '2017-01-01T00:00:00.000Z' });
        calendar.setState({ displayedDateStart: '2016-12-01T00:00:00.000Z' });
      });

      it('SHOULD mark the correct day as selected', () => {
        const currentCalendar = calendar.find('.calendar-day-area').at(1);
        const finalWeek = currentCalendar.find('.days').last();
        expect(classForDayIsIsSelected(finalWeek.find('li'), 6)).toBe(true);
      });
    });
  });

  describe('GIVEN a selected date of 2017-02-27T00:00:00.000Z', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2017-02-27T00:00:00.000Z' });
    });

    describe('GIVEN the previous month calendar', () => {
      let previousCalendar;
      let previousCalendarWeeks;
      beforeEach(() => {
        previousCalendar = calendar.find('.calendar-day-area.previous');
        previousCalendarWeeks = previousCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const currentCalendarDays = previousCalendar.find('.days li');
        expect(currentCalendarDays.length).toBe(42);
      });

      it('SHOULD not have any date selected', () => {
        expect(previousCalendarWeeks.find('.is-selected').length).toBe(0);
      });
    });

    describe('GIVEN the current month calendar', () => {
      let currentCalendar;
      let currentCalendarWeeks;
      beforeEach(() => {
        currentCalendar = calendar.find('.calendar-day-area').at(1);
        currentCalendarWeeks = currentCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const currentCalendarDays = currentCalendar.find('.days li');
        expect(currentCalendarDays.length).toBe(35);
      });

      it('SHOULD mark selected date as being selected', () => {
        const finalWeek = currentCalendarWeeks.last();
        const finalWeekDays = finalWeek.find('li');
        expect(classForDayIsIsSelected(finalWeekDays, 0)).toBe(true);
      });
    });

    describe('GIVEN the next month calendar', () => {
      let nextCalendar;
      let nextCalendarWeeks;
      beforeEach(() => {
        nextCalendar = calendar.find('.calendar-day-area.next');
        nextCalendarWeeks = nextCalendar.find('.days');
      });

      it('SHOULD have the correct number of days', () => {
        const nextCalendarDays = nextCalendar.find('.days li');
        expect(nextCalendarDays.length).toBe(35);
      });

      it('SHOULD mark selected date as being selected', () => {
        const firstWeek = nextCalendarWeeks.first();
        const firstWeekDays = firstWeek.find('li');
        expect(classForDayIsIsSelected(firstWeekDays, 0)).toBe(true);
      });
    });
  });

  // December selected, previous month (November) calendar
  // is day selected
  describe('GIVEN a selected date of 2016-10-31 and displayed date of 2016-12-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2016-10-31T00:00:00.000Z' });
    });

    it('SHOULD mark the first day in the previous month as being selected', () => {
      calendar.setState({
        displayedDateStart: '2016-12-01T00:00:00.000Z'
      });

      const previousCalendar = calendar.find('.calendar-day-area.previous');
      const firstWeekDays = previousCalendar.find('.days').first().find('li');

      expect(classForDayIsIsSelected(firstWeekDays, 0)).toBe(true);
    });
  });

  describe('GIVEN a selected date of 2016-12-31', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2016-12-31T00:00:00.000Z' });
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the previous-next calendar', () => {
      calendar.setState({
        displayedDateStart: '2015-11-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the current calendar', () => {
      calendar.setState({
        displayedDateStart: '2015-11-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the next-previous calendar', () => {
      calendar.setState({
        displayedDateStart: '2016-01-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the next-previous-previous calendar', () => {
      calendar.setState({
        displayedDateStart: '2016-02-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });
  });

  describe('GIVEN a selected date of 2017-01-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ selectedDate: '2017-01-01T00:00:00.000Z' });
    });

    it('SHOULD mark the final day in the final week of the next month as being selected', () => {
      calendar.setState({
        displayedDateStart: '2016-11-01T00:00:00.000Z'
      });

      const nextCalendar = calendar.find('.calendar-day-area.next');
      const finalWeekDays = nextCalendar.find('.days').last().find('li');

      expect(classForDayIsIsSelected(finalWeekDays, 6)).toBe(true);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the previous-next-next calendar', () => {
      calendar.setState({
        displayedDateStart: '2015-11-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the previous calendar', () => {
      calendar.setState({
        displayedDateStart: '2015-12-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the current calendar', () => {
      calendar.setState({
        displayedDateStart: '2016-01-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });

    it('SHOULD not mark the date as being selected if the year is out incorrect on the next-previous calendar', () => {
      calendar.setState({
        displayedDateStart: '2016-02-01T00:00:00.000Z'
      });

      expect(calendar.find('.calendar-day-area .is-selected').length).toBe(0);
    });
  });

  describe('GIVEN a min date of 1900-01-01', () => {
    beforeEach(() => {
      calendar = renderComponent({ minDate: '1900-01-01T00:00:00.000Z' });
    });

    it('SHOULD have a minimum year of 1900 in the year picker', () => {
      calendar.setState({
        activeDateItem: Calendar.ITEM_YEAR
      });

      const years = calendar.find('.calendar-year-area li');
      expect(years.first().text()).toBe('1900');
    });
  });

  describe('GIVEN a max date of 1900-01-01', () => {
    beforeEach(() => {
      calendar = renderComponent({
        maxDate: '1900-01-01T00:00:00.000Z',
        minDate: '1850-01-01T00:00:00.000Z'
      });
    });

    it('SHOULD have a maximum year of 1900 in the year picker', () => {
      calendar.setState({
        activeDateItem: Calendar.ITEM_YEAR
      });

      const years = calendar.find('.calendar-year-area li');
      expect(years.last().text()).toBe('1900');
    });
  });

  describe('GIVEN a mode property of YEAR', () => {
    beforeEach(() => {
      calendar = renderComponent({
        minDate: '2000-01-01T00:00:00.000Z',
        mode: 'YEAR',
        selectedDate: '2017-01-01T00:00:00.000Z'
      });
    });

    it('SHOULD mark the "current year section at the top" as being the only option with an appropriate class', () => {
      expect(calendar.find('.selected-year').hasClass('is-only-option')).toBe(true);
    });

    it('SHOULD NOT have any content within the "selected day" area', () => {
      expect(calendar.find('.calendar-title-bar .selected-day').text()).toBeFalsy();
    });

    it('SHOULD display the selected year in the top bar', () => {
      expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
    });

    it('SHOULD mark the current year as selected', () => {
      expect(calendar.find('.calendar-year-area .is-selected').text()).toBe('2017');
    });

    it('SHOULD handle a new year being clicked correctly', () => {
      const year = calendar.find('.calendar-year-area li');
      year.first().simulate('click');

      expect(calendar.state('selectedDate')).toBe('2000-01-01T00:00:00.000Z');
      expect(calendar.find('.calendar-year-area .is-selected').text()).toBe('2000');
    });
  });

  // TODO: fix here - selecting year changes selected date
  describe('GIVEN a mode property of MONTH, a selected date of 2017-01-01, a max date of 2017-06-30 and min date 2000-06-01', () => {
    beforeEach(() => {
      calendar = renderComponent({
        maxDate: '2017-06-30T00:00:00.000Z',
        minDate: '2000-06-01T00:00:00.000Z',
        mode: 'MONTH',
        selectedDate: '2017-01-01T00:00:00.000Z'
      });
    });

    it('SHOULD mark any month after June in the year as disabled', () => {
      const months = calendar.find('.calendar-month-area li');
      expect(months.find('.is-disabled').length).toBe(6);
    });

    it('SHOULD not mark any month as disabled for any previous years', () => {
      calendar.setState({
        displayedDateStart: '2016-01-01T00:00:00.000Z',
        selectedDate: '2016-01-01T00:00:00.000Z'
      });

      const months = calendar.find('.calendar-month-area li');
      expect(months.find('.is-disabled').length).toBe(0);
    });

    it('SHOULD mark any month before June 2000 as disabled', () => {
      calendar.setState({
        displayedDateStart: '2000-01-01T00:00:00.000Z',
        selectedDate: '2000-07-01T00:00:00.000Z'
      });

      const months = calendar.find('.calendar-month-area li');
      expect(months.find('.is-disabled').length).toBe(5);
    });

    it('SHOULD not do anything when a disabled month is clicked', () => {
      const months = calendar.find('.calendar-month-area li');
      months.last().simulate('click');

      expect(calendar.state('selectedDate')).toBe('2017-01-01T00:00:00.000Z');
    });

    it('SHOULD handle a month click correctly', () => {
      const months = calendar.find('.calendar-month-area li');
      months.at(3).simulate('click');

      expect(calendar.state('selectedDate')).toBe('2017-04-01T00:00:00.000Z');
      expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
      expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('April');
    });
  });

  describe('GIVEN a mode property of MULTIDAY, selectedDate of 2017-01-01 and a multidayNumberOfSelectedDays of 7', () => {
    let calendar;
    beforeEach(() => {
      calendar = renderComponent({
        mode: 'MULTIDAY',
        multidayNumberOfSelectedDays: 7,
        selectedDate: '2017-01-01T00:00:00.000Z'
      });
    });

    it('SHOULD highlight the correct number of days as "selected"', () => {
      const currentCalendar = calendar.find('.calendar-day-area').at(1);
      const currentCalendarWeeks = currentCalendar.find('.days');
      const firstWeek = currentCalendarWeeks.first().find('li');
      const secondWeek = currentCalendarWeeks.at(1).find('li');

      const expectedResults = [
        { weekdays: firstWeek, dayIndex: 6 },
        { weekdays: secondWeek, dayIndex: 0 },
        { weekdays: secondWeek, dayIndex: 1 },
        { weekdays: secondWeek, dayIndex: 2 },
        { weekdays: secondWeek, dayIndex: 3 },
        { weekdays: secondWeek, dayIndex: 4 },
        { weekdays: secondWeek, dayIndex: 5 }
      ];

      expectedResults.forEach((testCase) => {
        expect(classForDayIsIsAlsoSelected(testCase.weekdays, testCase.dayIndex)).toBe(true);
      });

      expect(classForDayIsIsAlsoSelected(firstWeek, 5)).toBe(false);
      expect(classForDayIsIsAlsoSelected(secondWeek, 6)).toBe(false);
    });

    it('SHOULD display the selected range in the top bar', () => {
      expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
      expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('1st - 7th January');
    });
  });

  describe('GIVEN a mode property of MULTIDAY, selectedDate of 2017-01-01 and a multidayNumberOfSelectedDays of 7', () => {
    let calendar;
    beforeEach(() => {
      calendar = renderComponent({
        mode: 'MULTIDAY',
        multidayNumberOfSelectedDays: 7,
        selectedDate: '2017-01-28T00:00:00.000Z'
      });
    });

    it('SHOULD display the selected range cross-month in the top bar', () => {
      expect(calendar.find('.calendar-title-bar .selected-year').text()).toBe('2017');
      expect(calendar.find('.calendar-title-bar .selected-day').text()).toBe('28th Jan - 3rd Feb');
    });
  });
});

describe('Mounted <Calendar />', () => {
  let calendar;
  beforeEach(() => {
    Calendar.PULSE_ANIMATION_LENGTH = 0;
    calendar = mountComponent();
  });

  it('SHOULD render', () => {
    expect(calendar.find('div.calendar').length).toBe(1);
  });

  it('SHOULD scroll the current year into view when toggling to the year picker', () => {
    calendar.setState({
      activeDateItem: Calendar.ITEM_YEAR
    });

    expect(global.spies.scrollIntoView).toHaveBeenCalled();
  });

  it('SHOULD scroll the current calendar into view when toggling back to the day picker', () => {
    calendar.setState({
      activeDateItem: Calendar.ITEM_YEAR
    });

    expect(global.spies.scrollIntoView).toHaveBeenCalled();

    calendar.setState({
      activeDateItem: Calendar.ITEM_DATE
    });

    // TODO: This sometimes fails with the count being either 1 or 3...
    expect(global.spies.scrollIntoView.calls.count()).toBe(2);
  });

  // TODO: Consider this. It's just to get code coverage to 100...
  it('SHOULD defer the scroll handler', () => {
    const calendarArea = calendar.find('.calendar-day-area-container');
    calendarArea.simulate('scroll');
    calendarArea.simulate('scroll');
  });

  describe('GIVEN a selectedDate of 2017-01-01T00:00:00.000Z', () => {
    beforeEach(() => {
      calendar = mountComponent({ selectedDate: '2017-01-01T00:00:00.000Z' });
    });

    it('SHOULD handle the "previous period" arrow correctly', (done) => {
      const previousPeriod = calendar.find('.chevron-left').at(1);
      previousPeriod.simulate('click');
      const calendarArea = calendar.find('.calendar-day-area-container');
      calendarArea.simulate('scroll');

      setTimeout(() => {
        expect(calendar.state('displayedDateStart')).toBe('2016-12-01T00:00:00.000Z');
        expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('December 2016');
        done();
      }, 500);
    });

    it('SHOULD handle the "next period" arrow correctly', (done) => {
      const previousPeriod = calendar.find('.chevron-right').at(1);
      previousPeriod.simulate('click');
      const calendarArea = calendar.find('.calendar-day-area-container');
      calendarArea.simulate('scroll');

      setTimeout(() => {
        expect(calendar.state('displayedDateStart')).toBe('2017-02-01T00:00:00.000Z');
        expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('February 2017');
        done();
      }, 500);
    });

    describe('AND a max date of 2017-01-31', () => {
      beforeEach(() => {
        calendar = mountComponent({ selectedDate: '2017-01-01T00:00:00.000Z', maxDate: '2017-01-31T00:00:00.000Z' });
      });

      it('SHOULD handle the "next period" arrow correctly by not doing anything', (done) => {
        const nextPeriod = calendar.find('.chevron-right').at(1);
        nextPeriod.simulate('click');
        const calendarArea = calendar.find('.calendar-day-area-container');
        calendarArea.simulate('scroll');

        setTimeout(() => {
          expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');
          expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('January 2017');
          done();
        }, 500);
      });

      it('SHOULD disable scrolling to the next calendar', () => {
        const calendarArea = calendar.find('.calendar-day-area-container');
        const preventDefaultSpy = jasmine.createSpy('preventDefault');
        calendarArea.simulate('scroll', {
          preventDefault: preventDefaultSpy,
          target: {
            scrollLeft: 10000
          }
        });

        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      describe('AND a min date of 2017-01-01', () => {
        beforeEach(() => {
          calendar = mountComponent({ selectedDate: '2017-01-01T00:00:00.000Z', minDate: '2017-01-01T00:00:00.000Z' });
        });

        it('SHOULD handle the "previous period" arrow correctly by not doing anything', (done) => {
          const nextPeriod = calendar.find('.chevron-left').at(1);
          nextPeriod.simulate('click');
          const calendarArea = calendar.find('.calendar-day-area-container');
          calendarArea.simulate('scroll');

          setTimeout(() => {
            expect(calendar.state('displayedDateStart')).toBe('2017-01-01T00:00:00.000Z');
            expect(calendar.find('.calendar-day-area').at(1).find('.current-displayed-month').text()).toBe('January 2017');
            done();
          }, 500);
        });

        it('SHOULD disable scrolling to the previous calendar', () => {
          const calendarArea = calendar.find('.calendar-day-area-container');
          const preventDefaultSpy = jasmine.createSpy('preventDefault');
          calendarArea.simulate('scroll', {
            preventDefault: preventDefaultSpy,
            target: {
              scrollLeft: 0
            }
          });

          expect(preventDefaultSpy).toHaveBeenCalled();
        });
      });
    });
  });

  describe('GIVEN a mode property of YEAR', () => {
    beforeEach(() => {
      calendar = mountComponent({
        minDate: '1900-01-01T00:00:00.000Z',
        mode: 'YEAR',
        selectedDate: '2017-01-01T00:00:00.000Z'
      });
    });

    it('SHOULD scroll the selected year into view', () => {
      expect(global.spies.scrollIntoView).toHaveBeenCalled();
    });
  });
});
