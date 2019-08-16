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

export async function getOrganizations(simplified) {
  const response = await axios.get(config.server + '/api/v2/organizations' + (simplified ? '/simplified' : ''),
    axiosConfig);
  if (check(response)) {
    return response.data.organizations;
  }
}

export async function updateOrganization({name, users, managers, types}) {
  const response = await axios.post(config.server + '/api/v2/organizations',
    {name, users, managers, types}, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function deleteOrganization(name) {
  const response = await axios.delete(config.server + '/api/v2/organizations/' + name, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function getOrganizationTypes() {
  const response = await axios.get(config.server + '/api/v2/orgtypes', axiosConfig);
  if (check(response)) {
    return response.data.types;
  }
}

export async function updateOrganizationTypes({name, organizations}) {
  const response = await axios.post(config.server + '/api/v2/orgtypes',
    {name, organizations}, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function deleteOrganizationTypes(name) {
  const response = await axios.delete(config.server + '/api/v2/orgtypes/' + name, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}
