# React DatePicker

Datepicker component loosely based around Material UI design.

Demo
----

Todo...

Usage
-----

```js
import Calendar from '@kaluza/react-datepicker';

const Page = (props) => (
  <div className="my-page">
    <Calendar />
  </div>
);
```

Props
-----

```js
maxDate  PropTypes.string (ISO Formatted Date)
Default: Today

 

minDate  PropTypes.string (ISO Formatted Date)
Default: 0000-01-01

 

mode     PropTypes.oneOf(['DAY', 'MULTIDAY', 'MONTH', 'YEAR'])
Default: DAY

 

multidayNumberOfSelectedDays   PropTypes.number
Default: 1

 

onCancel  PropTypes.func
Default: () => {}

 

onSelect PropTypes.func
Default: () => {}

 

selectedDate PropTypes.string (ISO Formatted Date)
Default: Today

```
