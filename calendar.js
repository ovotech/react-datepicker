import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import './calendar.less';
import chevronLeft from './assets/chevron-left.png';
import chevronRight from './assets/chevron-right.png';
import chevronLeftDisabled from './assets/chevron-left-grey.png';
import chevronRightDisabled from './assets/chevron-right-grey.png';

/* eslint-disable */
const now = new Date();

class Calendar extends Component {
  static propTypes = {
    maxDate: PropTypes.string,
    minDate: PropTypes.string,
    mode: PropTypes.oneOf(['DAY', 'MULTIDAY', 'MONTH', 'YEAR']),
    multidayNumberOfSelectedDays: PropTypes.number,
    onCancel: PropTypes.func,
    onSelect: PropTypes.func,
    selectedDate: PropTypes.string
  };

  static defaultProps = {
    maxDate: new Date().toISOString(),
    minDate: new Date('0000-01-01').toISOString(),
    mode: 'DAY',
    multidayNumberOfSelectedDays: 1, // TODO: This breaks cross-month if days > 7
    onCancel: () => {},
    onSelect: (selectedDateIso) => {},
    selectedDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  };

  static ITEM_DATE = 'ITEM_DATE';
  static ITEM_YEAR = 'ITEM_YEAR';
  static PULSE_ANIMATION_LENGTH = 0.5; // seconds
  static DIFFERENT_MONTH_MARGIN_SIZE = 32; // px

  static calculateDateDayOfWeekPairs = (date) => {
    const displayedStartDateYear = date.getFullYear();
    const displayedStartDateMonth = date.getMonth() + 1;
    const monthAsDate = new Date(displayedStartDateYear, displayedStartDateMonth, 0);
    monthAsDate.setFullYear(displayedStartDateYear);
    const daysInMonth = monthAsDate.getDate();
    const firstDateDay = date.getDay();

    const dateDayOfWeekPairs = [];
    let daysInPreviousMonth = 0;
    if (firstDateDay !== 1) {
      if (displayedStartDateMonth === 1) {
        daysInPreviousMonth = 31;
      } else {
        let previousMonth = new Date(displayedStartDateYear, displayedStartDateMonth - 1, 0);
        previousMonth.setFullYear(displayedStartDateYear);
        daysInPreviousMonth =previousMonth.getDate();
      }
    }

    let currentDateDay = 1;
    let currentDate = 1;

    const daysInMonthModifier = firstDateDay + (firstDateDay === 0 ? 6 : -1);
    for (let i = 1; i <= daysInMonth + daysInMonthModifier; ++i) {
      if (i < (firstDateDay || 7)) {
        const previousDayDate = (daysInPreviousMonth - (firstDateDay || 7)) + (i + 1);
        dateDayOfWeekPairs.push({ date: previousDayDate, dayOfWeek: currentDateDay++, isPreviousMonth: true });
      } else {
        dateDayOfWeekPairs.push({ date: currentDate++, dayOfWeek: currentDateDay++ });
      }
      if (currentDateDay > 6) {
        currentDateDay = 0;
      }
    }

    const remainingDaysForWeek = 7 - (dateDayOfWeekPairs.length % 7);

    if (remainingDaysForWeek !== 0 && remainingDaysForWeek !== 7) {
      for (let i = 0; i < remainingDaysForWeek; ++i) {
        dateDayOfWeekPairs.push({ date: i + 1, dayOfWeek: currentDateDay++ , isNextMonth: true });
      }
    }

    return dateDayOfWeekPairs;
  };

  constructor(props) {
    super(props);
    const selectedDateAsDate = new Date(props.selectedDate);
    const displayedDateStart = new Date(selectedDateAsDate.getFullYear(), selectedDateAsDate.getMonth(), 1);
    displayedDateStart.setFullYear(selectedDateAsDate.getFullYear());
    this.state = {
      activeDateItem: props.mode === 'YEAR' ? Calendar.ITEM_YEAR : Calendar.ITEM_DATE,
      displayedDateStart: displayedDateStart.toISOString(),
      selectedDate: props.selectedDate
    };

    this.snapScrollTimer = null;
    this.refMonthLeft = null;
    this.refMonthRight = null;
    this.calendarDayAreaContainerNode = null;
    this.activeYearNode = null;

    this.selectedItemNumbers = [];
  }

  componentDidMount() {
    if (this.calendarDayAreaContainerNode) {
      const calendarDayNodeWidth = this.calendarDayAreaContainerNode.getBoundingClientRect().width;
      this.calendarDayAreaContainerNode.scrollLeft = calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE;
    }

    if (this.state.activeDateItem === Calendar.ITEM_YEAR) {
      if (this.activeYearNode) {
        this.activeYearNode.scrollIntoView();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.activeDateItem === Calendar.ITEM_YEAR) {
      if (this.activeYearNode) {
        this.activeYearNode.scrollIntoView();
      }
    } else {
      if (this.calendarDayAreaContainerNode) {
        const calendarDayNodeWidth = this.calendarDayAreaContainerNode.getBoundingClientRect().width;
        this.calendarDayAreaContainerNode.scrollLeft = calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE;
      }
    }
  }

  snapAfterTimeout(event) {
    const element = event.target;

    clearTimeout(this.snapScrollTimer);
    this.snapScrollTimer = setTimeout(() => {
      const calendarDayNodeWidth = this.calendarDayAreaContainerNode.getBoundingClientRect().width;
      const width = calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE;
      const { scrollLeft } = element;

      if (scrollLeft > width + (width / 2)) {
        this.calendarDayAreaContainerNode.scrollLeft = width * 2;
        setTimeout(() => {
          const { displayedDateStart } = this.state;
          this.setState({
            displayedDateStart: moment(displayedDateStart).add(1, 'month').toISOString()
          }, () => {
            this.calendarDayAreaContainerNode.classList.add('no-transition');
            this.calendarDayAreaContainerNode.scrollLeft = width;
            this.calendarDayAreaContainerNode.classList.remove('no-transition');
          });
        }, 200);
      } else if (scrollLeft < width - (width / 2)) {
        this.calendarDayAreaContainerNode.scrollLeft = 0;
        setTimeout(() => {
          const { displayedDateStart } = this.state;
          this.setState({
            displayedDateStart: moment(displayedDateStart).add(-1, 'month').toISOString()
          }, () => {
            this.calendarDayAreaContainerNode.classList.add('no-transition');
            this.calendarDayAreaContainerNode.scrollLeft = width;
            this.calendarDayAreaContainerNode.classList.remove('no-transition');
          });
        }, 200);
      } else {
        this.calendarDayAreaContainerNode.scrollLeft = width;
      }
    }, 50);
  }

  // TODO: Attempt to re-do this bad boy. But only after tests are in place. 'cos it's perfe... working right now.
  renderWeek(dateDayOfWeekPairs, isPreviousMonthCalendar, isNextMonthCalendar, weekNumber) {
    const { displayedDateStart } = this.state;
    const displayedStartAsDate = new Date(displayedDateStart);
    const selectedDateAsDate = new Date(this.state.selectedDate);

    const isDisplayedMonthSelectedMonth = selectedDateAsDate.getMonth() === displayedStartAsDate.getMonth();
    const isDisplayedYearSelectedYear = selectedDateAsDate.getFullYear() === displayedStartAsDate.getFullYear();

    const previousDisplayedMonthDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() - 1, 1);
    previousDisplayedMonthDate.setFullYear(previousDisplayedMonthDate.getMonth() === 11 ? displayedStartAsDate.getFullYear() - 1 : displayedStartAsDate.getFullYear());
    const isPreviousDisplayedMonthSelectedMonth = selectedDateAsDate.getMonth() === previousDisplayedMonthDate.getMonth();
    let previousCalendarYear = displayedStartAsDate.getFullYear();
    if (displayedStartAsDate.getMonth() === 0) {
      previousCalendarYear -= 1;
    }

    const isPreviousDisplayedYearSelectedYear = selectedDateAsDate.getFullYear() === previousCalendarYear;

    const nextDisplayedMonthDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() + 1, 1);
    nextDisplayedMonthDate.setFullYear(nextDisplayedMonthDate.getMonth() === 0 ? displayedStartAsDate.getFullYear() + 1 : displayedStartAsDate.getFullYear());
    const isNextDisplayedMonthSelectedMonth = selectedDateAsDate.getMonth() === nextDisplayedMonthDate.getMonth();
    let nextCalendarYear = displayedStartAsDate.getFullYear();
    if (displayedStartAsDate.getMonth() === 11) {
      nextCalendarYear += 1;
    }
    const isNextDisplayedYearSelectedYear = selectedDateAsDate.getFullYear() === nextCalendarYear;

    const previousMonthPreviousDisplayedMonthDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() - 2, 1);
    const nextMonthNextDisplayedMonthDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() + 2, 1);

    const maxDateAsDate = new Date(this.props.maxDate);
    const minDateAsDate = new Date(this.props.minDate);

    return dateDayOfWeekPairs.map((dayDatePair, dateDayWeekPairIndex) => {
      let daySpecificPreviousCalendarYear = previousCalendarYear;
      let daySpecificNextCalendarYear = nextCalendarYear;

      if (displayedStartAsDate.getMonth() === 1 && isPreviousMonthCalendar && dayDatePair.isPreviousMonth) {
        daySpecificPreviousCalendarYear -= 1;
      }
      if (displayedStartAsDate.getMonth() === 10 && isNextMonthCalendar && dayDatePair.isNextMonth) {
        daySpecificNextCalendarYear += 1;
      }

      const isSelectedInCurrentMonth =
        !isPreviousMonthCalendar && !isNextMonthCalendar &&
        !dayDatePair.isNextMonth && !dayDatePair.isPreviousMonth &&
        isDisplayedMonthSelectedMonth && isDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        isDisplayedYearSelectedYear;

      const isSelectedInCurrentMonthButIsNextMonth =
        !isPreviousMonthCalendar && !isNextMonthCalendar &&
        dayDatePair.isNextMonth &&
        isNextDisplayedMonthSelectedMonth && isNextDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        isNextDisplayedYearSelectedYear;

      const isSelectedInCurrentMonthButIsPreviousMonth =
        !isPreviousMonthCalendar && !isNextMonthCalendar &&
        dayDatePair.isPreviousMonth &&
        isPreviousDisplayedMonthSelectedMonth && isPreviousDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        (selectedDateAsDate.getMonth() === previousDisplayedMonthDate.getMonth()) &&
        isPreviousDisplayedYearSelectedYear;

      const isSelectedInPreviousMonth =
        isPreviousMonthCalendar &&
        !dayDatePair.isNextMonth && !dayDatePair.isPreviousMonth &&
        isPreviousDisplayedMonthSelectedMonth && isPreviousDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        isPreviousDisplayedYearSelectedYear;

      const isSelectedInPreviousMonthButIsNextMonth =
        isPreviousMonthCalendar &&
        dayDatePair.isNextMonth &&
        isDisplayedMonthSelectedMonth && isDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        (selectedDateAsDate.getMonth() === displayedStartAsDate.getMonth()) &&
        isDisplayedYearSelectedYear;

      const isSelectedInPreviousMonthButIsPreviousMonth =
        isPreviousMonthCalendar &&
        dayDatePair.isPreviousMonth &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        (selectedDateAsDate.getMonth() === previousMonthPreviousDisplayedMonthDate.getMonth()) &&
        (selectedDateAsDate.getFullYear() === daySpecificPreviousCalendarYear);

      const isSelectedInNextMonth =
        isNextMonthCalendar &&
        !dayDatePair.isNextMonth && !dayDatePair.isPreviousMonth &&
        isNextDisplayedMonthSelectedMonth && isNextDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        isNextDisplayedYearSelectedYear;

      const isSelectedInNextMonthButIsNextMonth =
        isNextMonthCalendar &&
        dayDatePair.isNextMonth &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        (selectedDateAsDate.getMonth() === nextMonthNextDisplayedMonthDate.getMonth()) &&
        (selectedDateAsDate.getFullYear() === daySpecificNextCalendarYear);

      const isSelectedInNextMonthButIsPreviousMonth =
        isNextMonthCalendar &&
        dayDatePair.isPreviousMonth &&
        isDisplayedMonthSelectedMonth && isDisplayedYearSelectedYear &&
        (selectedDateAsDate.getDate() === dayDatePair.date) &&
        (selectedDateAsDate.getMonth() === displayedStartAsDate.getMonth()) &&
        isDisplayedYearSelectedYear;

      const isSelected = isSelectedInCurrentMonth || isSelectedInCurrentMonthButIsNextMonth || isSelectedInCurrentMonthButIsPreviousMonth ||
        isSelectedInPreviousMonth || isSelectedInPreviousMonthButIsNextMonth || isSelectedInPreviousMonthButIsPreviousMonth ||
        isSelectedInNextMonth || isSelectedInNextMonthButIsNextMonth || isSelectedInNextMonthButIsPreviousMonth;


      const dayItemCumulativeNumber = dateDayWeekPairIndex + ((weekNumber - 1) * 7);

      if (isSelected) {
        this.selectedItemNumbers.push(dayItemCumulativeNumber);
      }

      let isAlsoSelected = false;
      const lastSelectedItemNumber = this.selectedItemNumbers[this.selectedItemNumbers.length - 1];
      if (
        dayItemCumulativeNumber - lastSelectedItemNumber < this.props.multidayNumberOfSelectedDays &&
        !dayDatePair.isPreviousMonth
      ) {
        isAlsoSelected = true;
      }

      let calendarYear = displayedStartAsDate.getFullYear();
      let currentOptionAsDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth(), dayDatePair.date);
      if (!isNextMonthCalendar && !isPreviousMonthCalendar) {
        if (dayDatePair.isNextMonth) {
          currentOptionAsDate = new Date(nextDisplayedMonthDate.getFullYear(), nextDisplayedMonthDate.getMonth(), dayDatePair.date);
        } else if (dayDatePair.isPreviousMonth) {
          currentOptionAsDate = new Date(previousDisplayedMonthDate.getFullYear(), previousDisplayedMonthDate.getMonth(), dayDatePair.date);
        }
      }
      if (isNextMonthCalendar) {
        if (dayDatePair.isPreviousMonth) {
          currentOptionAsDate = new Date(calendarYear, displayedStartAsDate.getMonth(), dayDatePair.date);
        } else if (dayDatePair.isNextMonth) {
          currentOptionAsDate = new Date(nextMonthNextDisplayedMonthDate.getFullYear(), nextMonthNextDisplayedMonthDate.getMonth(), dayDatePair.date);
        } else {
          currentOptionAsDate = new Date(nextDisplayedMonthDate.getFullYear(), nextDisplayedMonthDate.getMonth(), dayDatePair.date);
        }
      }
      if (isPreviousMonthCalendar) {
        if (dayDatePair.isPreviousMonth) {
          currentOptionAsDate = new Date(previousMonthPreviousDisplayedMonthDate.getFullYear(), previousMonthPreviousDisplayedMonthDate.getMonth(), dayDatePair.date);
        } else if (dayDatePair.isNextMonth) {
          currentOptionAsDate = new Date(calendarYear, displayedStartAsDate.getMonth(), dayDatePair.date);
        } else {
          currentOptionAsDate = new Date(previousDisplayedMonthDate.getFullYear(), previousDisplayedMonthDate.getMonth(), dayDatePair.date);
        }
      }

      const isDisabled = (
        (currentOptionAsDate.getTime() > maxDateAsDate.getTime()) ||
        (currentOptionAsDate.getTime() < minDateAsDate.getTime())
      );

      return (
        <li
          key={`day-${dayDatePair.date}`}
          onClick={() => {
            if (isPreviousMonthCalendar || isNextMonthCalendar || isDisabled) {
              return;
            }

            let selectedYear = displayedStartAsDate.getFullYear();
            let selectedMonth = displayedStartAsDate.getMonth();
            if (dayDatePair.isPreviousMonth) {
              if (selectedMonth === 0) {
                selectedYear = selectedYear - 1;
                selectedMonth = 11;
              } else {
                selectedMonth = selectedMonth - 1;
              }
            }
            if (dayDatePair.isNextMonth) {
              if (selectedMonth === 11) {
                selectedYear = selectedYear + 1;
                selectedMonth = 0;
              } else {
                selectedMonth = selectedMonth + 1;
              }
            }

            const newSelectedDate = new Date(Date.UTC(selectedYear, selectedMonth, dayDatePair.date));
            const newDisplayedDate = new Date(selectedYear, selectedMonth, 1);

            newSelectedDate.setFullYear(selectedYear);
            newDisplayedDate.setFullYear(selectedYear);

            newSelectedDate.setUTCDate(dayDatePair.date);
            newSelectedDate.setUTCHours(0);

            this.setState({
              displayedDateStart: newDisplayedDate.toISOString(),
              selectedDate: newSelectedDate.toISOString()
            });
          }}
        >
          <div
            className={classnames({
              'is-also-selected': isAlsoSelected,
              'is-selected': isSelected,
              'is-different-month': !isDisabled && (dayDatePair.isPreviousMonth || dayDatePair.isNextMonth),
              'is-disabled': isDisabled
            })}
            role="button"
            tabIndex={0}
          >
            <span>{dayDatePair.date}</span>
          </div>
        </li>
      );
    });
  }

  renderYearView() {
    const years = [];
    const maxYear = new Date(this.props.maxDate).getFullYear();
    for (let i = new Date(this.props.minDate).getFullYear(); i <= maxYear; ++i) {
      years.push(i);
    }

    const isOnlyYear = this.props.mode === 'YEAR';

    return (
      <ul
        className={classnames('calendar-year-area', {
          'is-faded': this.state.activeDateItem !== Calendar.ITEM_YEAR
        })}
      >
        {years.map((year) => {
          const isSelected = new Date(this.state.selectedDate).getFullYear() === year;
          return (
            <li
              key={`year-${year}`}
              className={classnames({
                'is-selected': isSelected
              })}
              ref={(node) => { this.activeYearNode = isSelected ? node : this.activeYearNode }}
              onClick={() => {
                const selectedDateAsDate = new Date(this.state.selectedDate);
                const newValue = new Date(year, selectedDateAsDate.getMonth(), selectedDateAsDate.getDate());
                newValue.setFullYear(year);
                const newDisplayedValue = new Date(year, selectedDateAsDate.getMonth(), 1);
                newDisplayedValue.setFullYear(year);

                this.setState({
                  activeDateItem: isOnlyYear ?  Calendar.ITEM_YEAR : Calendar.ITEM_DATE,
                  displayedDateStart: newDisplayedValue.toISOString(),
                  selectedDate: newValue.toISOString()
                });
              }}
            >
              {year}
            </li>
          )
        })}
      </ul>
    );
  }

  renderCalendarView() {
    const { displayedDateStart } = this.state;
    const displayedStartAsDate = new Date(displayedDateStart);
    const lastMonthAsDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() - 1, 1);
    const nextMonthAsDate = new Date(displayedStartAsDate.getFullYear(), displayedStartAsDate.getMonth() + 1, 1);

    lastMonthAsDate.setFullYear(displayedStartAsDate.getMonth() - 1 < 0 ? displayedStartAsDate.getFullYear() - 1 : displayedStartAsDate.getFullYear());
    nextMonthAsDate.setFullYear(displayedStartAsDate.getMonth() + 1 > 11 ? displayedStartAsDate.getFullYear() + 1 : displayedStartAsDate.getFullYear());

    const dateDayOfWeekPairs = Calendar.calculateDateDayOfWeekPairs(displayedStartAsDate);
    const previousDateDayOfWeekPairs = Calendar.calculateDateDayOfWeekPairs(lastMonthAsDate);
    const nextDateDayOfWeekPairs = Calendar.calculateDateDayOfWeekPairs(nextMonthAsDate);

    const minDateAsDate = new Date(this.props.minDate);
    const maxDateAsDate = new Date(this.props.maxDate);

    const lastDayCurrent = dateDayOfWeekPairs[dateDayOfWeekPairs.length - 1];
    const lastDayCurrentCalendarDate = new Date(displayedStartAsDate.getFullYear(), lastDayCurrent.isNextMonth ? displayedStartAsDate.getMonth() + 1: displayedStartAsDate.getMonth(), lastDayCurrent.date);

    const firstDayNext = nextDateDayOfWeekPairs[0];
    const firstDayNextCalendarDate = new Date(displayedStartAsDate.getFullYear(), firstDayNext.isPreviousMonth ? displayedStartAsDate.getMonth() : displayedStartAsDate.getMonth() + 1, firstDayNext.date);

    const firstDayCurrent = dateDayOfWeekPairs[0];
    const firstDayCurrentCalendarDate = new Date(displayedStartAsDate.getFullYear(), firstDayCurrent.isPreviousMonth ? displayedStartAsDate.getMonth() - 1 : displayedStartAsDate.getMonth(), firstDayCurrent.date);
    if (firstDayCurrent.isPreviousMonth && displayedStartAsDate.getMonth() === 0) {
      firstDayCurrentCalendarDate.setFullYear(displayedStartAsDate.getFullYear() - 1);
    }

    const lastDayPrevious = previousDateDayOfWeekPairs[previousDateDayOfWeekPairs.length - 1];
    const lastDayPreviousCalendarDate = new Date(displayedStartAsDate.getFullYear(), lastDayPrevious.isNextMonth ? displayedStartAsDate.getMonth(): displayedStartAsDate.getMonth() - 1, lastDayPrevious.date);
    lastDayPreviousCalendarDate.setFullYear(lastDayPrevious.isNextMonth && displayedStartAsDate.getMonth() === 11 ? displayedStartAsDate.getFullYear() : displayedStartAsDate.getMonth() === 0 ? displayedStartAsDate.getFullYear() - 1 : displayedStartAsDate.getFullYear());

    const lastVisibleDayCurrentCalendarIsGreaterThanMaxDate = lastDayCurrentCalendarDate.getTime() > maxDateAsDate.getTime();
    const firstVisibleDayNextCalendarIsGreaterThanMaxDate =  firstDayNextCalendarDate.getTime() > maxDateAsDate.getTime();

    const lastVisibleDayPreviousCalendarIsLessThanMinDate = lastDayPreviousCalendarDate.getTime() < minDateAsDate.getTime();
    const firstVisibleDayCurrentCalendarIsLessThanMinDate =  firstDayCurrentCalendarDate.getTime() < minDateAsDate.getTime();

    const isEntirelyPastMaxDate = lastVisibleDayCurrentCalendarIsGreaterThanMaxDate || firstVisibleDayNextCalendarIsGreaterThanMaxDate;
    const isEntirelyPastMinDate = firstVisibleDayCurrentCalendarIsLessThanMinDate || lastVisibleDayPreviousCalendarIsLessThanMinDate;

    return (
      <div
        className={classnames('calendar-calendar-area', {
          'is-faded': this.state.activeDateItem === Calendar.ITEM_YEAR
        })}
      >
        <div className="calendar-content">
          <div
            className="calendar-day-area-container"
            ref={(node) => { this.calendarDayAreaContainerNode = node; }}
            onScroll={(e) => {
              const calendarDayNodeWidth = this.calendarDayAreaContainerNode.getBoundingClientRect().width;
              const isScrollingLeft = e.target.scrollLeft < (calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE);
              const isScrollingRight = e.target.scrollLeft > (calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE);

              if ((isScrollingLeft && isEntirelyPastMinDate) || (isScrollingRight && isEntirelyPastMaxDate)) {
                this.calendarDayAreaContainerNode.classList.add('no-transition');
                e.preventDefault();
                setTimeout(() => {
                  this.calendarDayAreaContainerNode.scrollLeft = calendarDayNodeWidth + Calendar.DIFFERENT_MONTH_MARGIN_SIZE;
                  this.calendarDayAreaContainerNode.classList.remove('no-transition');
                }, 0);
                return;
              }

              this.snapAfterTimeout(e);
            }}
          >
            <div
              className={classnames('calendar-day-area previous', {
                'is-past-min-max-date': isEntirelyPastMinDate
              })}
            >
              <p className="current-displayed-month">
                <span
                  className={classnames('chevron-left', {
                    'is-past-min-max-date': isEntirelyPastMinDate
                  })}
                >
                  <img src={isEntirelyPastMinDate ? chevronLeftDisabled : chevronLeft} />
                </span>

                {moment(lastMonthAsDate).format('MMMM YYYY')}

                <span
                  className={classnames('chevron-right', {
                    'is-past-min-max-date': isEntirelyPastMaxDate
                  })}
                >
                  <img src={isEntirelyPastMaxDate ? chevronRightDisabled : chevronRight} />
                </span>
              </p>

              <ul className="day-letters">
                <li>M</li>
                <li>T</li>
                <li>W</li>
                <li>T</li>
                <li>F</li>
                <li>S</li>
                <li>S</li>
              </ul>
              <ul className="days">
                {this.renderWeek(previousDateDayOfWeekPairs.slice(0, 7), true, false, 1)}
              </ul>
              <ul className="days">
                {this.renderWeek(previousDateDayOfWeekPairs.slice(7, 14), true, false, 2)}
              </ul>
              <ul className="days">
                {this.renderWeek(previousDateDayOfWeekPairs.slice(14, 21), true, false, 3)}
              </ul>
              <ul className="days">
                {this.renderWeek(previousDateDayOfWeekPairs.slice(21, 28), true, false, 4)}
              </ul>
              {previousDateDayOfWeekPairs.length > 28 ? (
                <ul className="days">
                  {this.renderWeek(previousDateDayOfWeekPairs.slice(28, 35), true, false, 5)}
                </ul>
              ) : null}
              {previousDateDayOfWeekPairs.length > 35 ? (
                <ul className="days">
                  {this.renderWeek(previousDateDayOfWeekPairs.slice(35), true, false, 6)}
                </ul>
              ) : null}
            </div>

            <div className="calendar-day-area">
              <p className="current-displayed-month">
                <span
                  className={classnames('chevron-left', {
                    'is-past-min-max-date': isEntirelyPastMinDate
                  })}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isEntirelyPastMinDate) {
                      return;
                    }

                    clearTimeout(this.monthLeftActiveTimeout);
                    this.refMonthLeft.classList.add('active');
                    this.monthLeftActiveTimeout = setTimeout(() => {
                      this.refMonthLeft.classList.remove('active');
                    }, Calendar.PULSE_ANIMATION_LENGTH * 1000);
                    this.calendarDayAreaContainerNode.scrollLeft = 0;
                  }}
                  ref={(node) => { this.refMonthLeft = node; }}
                >
                  <img src={isEntirelyPastMinDate ? chevronLeftDisabled : chevronLeft} />
                </span>

                {moment(displayedStartAsDate).format('MMMM YYYY')}

                <span
                  className={classnames('chevron-right', {
                    'is-past-min-max-date': isEntirelyPastMaxDate
                  })}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isEntirelyPastMaxDate) {
                      return;
                    }

                    clearTimeout(this.monthRightActiveTimeout);
                    this.refMonthRight.classList.add('active');
                    this.monthRightActiveTimeout = setTimeout(() => {
                      this.refMonthRight.classList.remove('active');
                    }, Calendar.PULSE_ANIMATION_LENGTH * 1000);
                    this.calendarDayAreaContainerNode.scrollLeft = 100000;
                  }}
                  ref={(node) => { this.refMonthRight = node; }}
                >
                  <img src={isEntirelyPastMaxDate ? chevronRightDisabled : chevronRight} />
                </span>
              </p>
              <ul className="day-letters">
                <li>M</li>
                <li>T</li>
                <li>W</li>
                <li>T</li>
                <li>F</li>
                <li>S</li>
                <li>S</li>
              </ul>
              <ul className="days">
                {this.renderWeek(dateDayOfWeekPairs.slice(0, 7), false, false, 7)}
              </ul>
              <ul className="days">
                {this.renderWeek(dateDayOfWeekPairs.slice(7, 14), false, false, 8)}
              </ul>
              <ul className="days">
                {this.renderWeek(dateDayOfWeekPairs.slice(14, 21), false, false, 9)}
              </ul>
              <ul className="days">
                {this.renderWeek(dateDayOfWeekPairs.slice(21, 28), false, false, 10)}
              </ul>
              {dateDayOfWeekPairs.length > 28 ? (
                <ul className="days">
                  {this.renderWeek(dateDayOfWeekPairs.slice(28, 35), false, false, 11)}
                </ul>
              ) : null}
              {dateDayOfWeekPairs.length > 35 ? (
                <ul className="days">
                  {this.renderWeek(dateDayOfWeekPairs.slice(35), false, false, 12)}
                </ul>
              ) : null}
            </div>

            <div
              className={classnames('calendar-day-area next', {
                'is-past-min-max-date': isEntirelyPastMaxDate
              })}
            >
              <p className="current-displayed-month">
                <span
                  className={classnames('chevron-left', {
                    'is-past-min-max-date': isEntirelyPastMinDate
                  })}
                >
                  <img src={isEntirelyPastMinDate ? chevronLeftDisabled : chevronLeft} />
                </span>

                {moment(nextMonthAsDate).format('MMMM YYYY')}

                <span
                  className={classnames('chevron-right', {
                    'is-past-min-max-date': isEntirelyPastMaxDate
                  })}
                >
                  <img src={isEntirelyPastMaxDate ? chevronRightDisabled : chevronRight} />
                </span>
              </p>
              <ul className="day-letters">
                <li>M</li>
                <li>T</li>
                <li>W</li>
                <li>T</li>
                <li>F</li>
                <li>S</li>
                <li>S</li>
              </ul>
              <ul className="days">
                {this.renderWeek(nextDateDayOfWeekPairs.slice(0, 7), false, true, 13)}
              </ul>
              <ul className="days">
                {this.renderWeek(nextDateDayOfWeekPairs.slice(7, 14), false, true, 14)}
              </ul>
              <ul className="days">
                {this.renderWeek(nextDateDayOfWeekPairs.slice(14, 21), false, true, 15)}
              </ul>
              <ul className="days">
                {this.renderWeek(nextDateDayOfWeekPairs.slice(21, 28), false, true, 16)}
              </ul>
              {nextDateDayOfWeekPairs.length > 28 ? (
                <ul className="days">
                  {this.renderWeek(nextDateDayOfWeekPairs.slice(28, 35), false, true, 17)}
                </ul>
              ) : null}
              {nextDateDayOfWeekPairs.length > 35 ? (
                <ul className="days">
                  {this.renderWeek(nextDateDayOfWeekPairs.slice(35), false, true, 18)}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderMonthPicker() {
    // TODO: Locales
    const months = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
    ];

    const maxDateAsDate = new Date(this.props.maxDate);
    const minDateAsDate = new Date(this.props.minDate);
    const selectedDateAsDate = new Date(this.state.selectedDate);
    const isCurrentYearMaxYear = selectedDateAsDate.getFullYear() >= maxDateAsDate.getFullYear();
    const isCurrentYearMinYear = selectedDateAsDate.getFullYear() <= minDateAsDate.getFullYear();

    return (
      <ul
        className={classnames('calendar-month-area', {
          'is-faded': this.state.activeDateItem === Calendar.ITEM_YEAR
        })}
      >
        {months.map((month, index) => {
          const isSelected = selectedDateAsDate.getMonth() === index;
          const isDisabled = (
            (isCurrentYearMaxYear && (index > maxDateAsDate.getMonth())) ||
            (isCurrentYearMinYear && (index < minDateAsDate.getMonth()))
          );

          return (
            <li
              key={`month-${month}`}
              className={classnames({
                'is-selected': isSelected,
                'is-disabled': isDisabled
              })}
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                const selectedDateAsDate = new Date(this.state.selectedDate);
                const newValue = new Date(selectedDateAsDate.getFullYear(), index, 1);
                newValue.setFullYear(selectedDateAsDate.getFullYear());
                const newDisplayedValue = new Date(selectedDateAsDate.getFullYear(), index, 1);
                newDisplayedValue.setFullYear(selectedDateAsDate.getFullYear());

                newValue.setUTCDate(1);
                newValue.setMonth(index);
                newValue.setUTCHours(0);

                this.setState({
                  activeDateItem: Calendar.ITEM_DATE,
                  displayedDateStart: newDisplayedValue.toISOString(),
                  selectedDate: newValue.toISOString()
                });
              }}
            >
              {month}
            </li>
          )
        })}
      </ul>
    );
  }

  renderCalendarSection() {
    switch (this.props.mode) {
      case 'DAY':
        return this.renderCalendarView();
      case 'MULTIDAY':
        return this.renderCalendarView();
      case 'MONTH':
        return this.renderMonthPicker();
      case 'YEAR':
      default:
        return null;
    }
  }

  renderTitleBarSelectedDate() {
    switch (this.props.mode) {
      case 'DAY':
        return moment(this.state.selectedDate).format('ddd D MMM');
      case 'MULTIDAY':
        const selectedDate = moment(this.state.selectedDate);
        const selectedEndDate = moment(this.state.selectedDate);
        selectedEndDate.add(this.props.multidayNumberOfSelectedDays - 1, 'days');
        if (selectedDate.month() === selectedEndDate.month()) {
          return `${selectedDate.format('Do')} - ${selectedEndDate.format('Do MMMM')}`;
        }
        return `${selectedDate.format('Do MMM')} - ${selectedEndDate.format('Do MMM')}`;
      case 'MONTH':
        return moment(this.state.selectedDate).format('MMMM');
      case 'YEAR':
      default: return null;
    }
  }

  render() {
    const { activeDateItem } = this.state;

    this.selectedItemNumbers = [];

    return (
      <div className="calendar">
        <div className="calendar-title-bar">
          <div className="calendar-content">
            <span
              className={classnames('selected-year', {
                active: activeDateItem === Calendar.ITEM_YEAR,
                'is-only-option': this.props.mode === 'YEAR'
              })}
              onClick={() => {
                this.setState({
                  activeDateItem: Calendar.ITEM_YEAR
                });
              }}
              role="button"
              tabIndex={0}
            >
              {moment(this.state.selectedDate).format('YYYY')}
            </span>
            <span
              className={classnames('selected-day', {
                active: activeDateItem === Calendar.ITEM_DATE
              })}
              onClick={() => {
                this.setState({
                  activeDateItem: Calendar.ITEM_DATE
                });
              }}
              role="button"
              tabIndex={0}
            >
              {this.renderTitleBarSelectedDate()}
            </span>
          </div>
        </div>

        {this.renderCalendarSection()}
        {this.renderYearView()}

        <button
          className="cancel-button"
          onClick={() => {
            this.props.onCancel();
          }}
        >
          Cancel
        </button>

        <button
          className="set-button"
          onClick={() => {
            this.props.onSelect(this.state.selectedDate);
          }}
        >
          Set
        </button>
      </div>
    );
  }
}
/* eslint-enable */

export default Calendar;
