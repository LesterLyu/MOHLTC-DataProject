# Workbook Query

Query user entered workbook data.

**URL** : `/api/workbook/query/`

**Method** : `GET`

**Permission required** : ```config.permissions.WORKBOOK_QUERY```

**Data constraints:**

| Name        |Type           | Default  | Description |
| ----------- |:-------------:| :--------: | :---------- |
| wbName | `String`       |     | Name of the workbook you want to query |
| queryData (*see below) | ` Object`   |     | Query data |

**queryData constraints:**

```javascript
queryData:
  {
    worksheetName1: // worksheet name
      [
        [1212, 1234],  // [catId, attId]
        [1232, 1235],
        [5432, 1335],
      ],
    worksheetName2: // worksheet name
      [
        [2323, 1232],  // [catId, attId]
        [1267, 1345],
      ]
  }
```
			

## Success Response

**Code** : `200 OK`

**Content example**

```javascript
{
    "success": true,
    "result": 
      {
         "worksheetName1": // worksheet name
          [
            [ // corresponding [catId, attId]
               {"username": "username1", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
            ],
            [
               {"username": "username1", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
            ],
            [ 
               {"username": "username1", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
            ],
          ],
        "worksheetName2": // worksheet name
          [
            [ // corresponding [catId, attId]
               {"username": "username1", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
            ],
            [
               {"username": "username1", "cat": "category name", "att": "attribute name", "data": "some data"},
               {"username": "username2", "cat": "category name", "att": "attribute name", "data": "some data"},
            ]
         ],
      }
}
```

## Error Response

**Condition** : N/A.

**Code** : `500 INTERNAL ERROR`

**Content** :

```json
{
    "success":false,
    "msg": "error message"
}
```
