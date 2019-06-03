# Filled Workbook Query

Query user entered workbook data **for your group**.

**URL** : `/api/query/workbook/`

**Method** : `GET`

**Permission required** : ```config.permissions.WORKBOOK_QUERY```

**Data constraints:**

| Name        |Type           | Default  | Description |
| ----------- |:-------------:| :--------: | :---------- |
| workbookName | `string`       |   *required*         | Name of the workbook you want to query |
| [username]   | `string`       |   `undefined\|null`  | The user you want to query, returns all users if not provided. |
| [attId]      | `number`       |   `undefined\|null`  | The attribute ID you want to constraint, returns all attribute IDs if not provided. |
| [catId]      | `number`       |   `undefined\|null`  | The category ID you want to constraint, returns all category IDs if not provided |


## Success Response

**Code** : `200 OK`

**Content example**

```javascript
{
    "success": true,
    "result": 
      {
         "fieldNames": // worksheet name
          [
	    "username"
	    "worksheetName",
	    "..."
          ],
	  data: []
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
