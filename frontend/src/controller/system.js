import axios from "axios";
import {check, axiosConfig, config} from "./common";

export async function getGroupName() {
  const response = await axios.get(config.server + '/api/v2/group', axiosConfig);
  if (check(response)) {
    return response.data.name;
  }
}

export async function setGroupName(name) {
  const response = await axios.post(config.server + '/api/v2/group', {name}, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

