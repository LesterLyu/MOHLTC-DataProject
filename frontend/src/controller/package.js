import axios from "axios";
import config from "./../config/config";
import {check} from "./common";

const axiosConfig = {withCredentials: true};

/**
 * @param name
 * @param userIds
 * @param workbookIds
 * @param startDate
 * @param endDate
 * @param adminNotes
 * @param published
 * @return {Promise}
 */
export async function createPackage({name, userIds, workbookIds, startDate, endDate, adminNotes, published}) {
  const response = await axios.post(config.server + '/packages', {
    name,
    userIds,
    workbookIds,
    startDate,
    endDate,
    adminNotes,
    published
  }, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}
