# User Status

Update a user's status. Used to disable or enable an account.

**URL** : `/api/users/:username/active/`

**Method** : `PUT`

**Permission required** : `USER_MANAGEMENT`

**Data constraints:** : 

| Name        |Type           | Default  | Description |
| ----------- |:-------------:| :--------: | :---------- |
| active | `boolean`       |   *required*         | true if enable a user, othereise disable a user. |

## Success Response

**Code** : `200 OK`

**Content example**

```javascript
{
  "success": true, // boolean
}
```

## Error Response

**Condition** : Server error.

**Code** : `500 INTERNAL ERROR`

**Content** :

```json
{
    "success":false,
    "msg": "error message"
}
```
