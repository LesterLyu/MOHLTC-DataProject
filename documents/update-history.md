# Update History
## Dev 0.2.8
  - Fix bug:
    - Data validation strings need to be trimmed.
    - Cannot evaluate formula start with ```=+```.
  - Improvements:
    - Supports hidden sheets.
    - Export excel with styles.

## Dev 0.2.7
 - Fix bug:
    - Edit Form: first time click on a number will erase the data.
    - Back-end: First row is trimmed sometimes.
 - Improvements:
    - Back-end: Add support for [custom defined name](https://support.office.com/en-us/article/define-and-use-names-in-formulas-4d0f13ac-53b7-422e-afd2-abd7ff379c64).
    - Back-end: Add support for [data validation](https://support.office.com/en-us/article/apply-data-validation-to-cells-29fecbcc-d1b9-42c1-9d76-eff3ce5f7249).
    - Front-end: Able to get defined name via ```gui.getDefinedName(string name)```
    - Front-end: Support dropdown ([excel list data validation](https://support.office.com/en-us/article/apply-data-validation-to-cells-29fecbcc-d1b9-42c1-9d76-eff3ce5f7249)).
        - Limitation: Does not support different sheet reference,
        e.g. ```=Sheet2!$A$2:$A$10```. Please define name to table range
        and use the defined name to setup data validation in Excel, [see this](https://www.contextures.com/xlDataVal01.html)
        - Limitation: Does not support style for now.
