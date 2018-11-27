# Workbook Query

Query user entered workbook data **for your group**.

**URL** : `/api/query/workbook/`

**Method** : `POST`

**Permission required** : ```config.permissions.WORKBOOK_QUERY```

**Data constraints:**

| Name        |Type           | Default  | Description |
| ----------- |:-------------:| :--------: | :---------- |
| wbName | `String`       |     | Name of the workbook you want to query |
| onlyFilled | ` Object`   |   `false`  | exclude the user who does not fill the workbook  |
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
               {"username": "username1", "catId": "1212", "attId": "1234", "data": "some data"},
               {"username": "username2", "catId": "1212", "attId": "1234", "data": "some data"},
            ],
            [
               {"username": "username1", "catId": "1232", "attId": "1235", "data": "some data"},
               {"username": "username2", "catId": "1232", "attId": "1235", "data": "some data"},
               {"username": "username2", "catId": "1232", "attId": "1235", "data": "some data"},
            ],
            [ 
               {"username": "username1", "catId": "5432", "attId": "1335", "data": "some data"},
               {"username": "username2", "catId": "5432", "attId": "1335", "data": "some data"},
            ],
          ],
        "worksheetName2": // worksheet name
          [
            [ // corresponding [catId, attId]
               {"username": "username1", "catId": "2323", "attId": "1232", "data": "some data"},
               {"username": "username2", "catId": "2323", "attId": "1232", "data": "some data"},
            ],
            [
               {"username": "username1", "catId": "1267", "attId": "1345", "data": "some data"},
               {"username": "username2", "catId": "1267", "attId": "1345", "data": "some data"},
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
