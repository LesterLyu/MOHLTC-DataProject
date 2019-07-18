import axios from "axios";
import config from "./../config/config";
import {generateObjectId} from './common';

const axiosConfig = {withCredentials: true};

/**
 * Singleton Pattern
 */
let instance = null;

export default class AttCatManager {

  constructor(props) {
    if (!instance) {
      instance = this;
      // init
      this.props = props;
    }
    return instance;
  }

  /**
   * check if login needed
   * @param response
   * @returns {boolean}
   */
  check(response) {
    if (response.headers['content-type'].includes('html')) {
      this.props.history.push('/login');
      return false;
    }
    return true;
  };

  add(isAttribute, id, name, description) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.post(config.server + '/api/v2/' + what, {id, name, description}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  /**
   * Get attribute or category
   * @param isAttribute
   * @return {Promise<AxiosResponse<T> | never>}
   */
  get(isAttribute) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.get(config.server + '/api/v2/' + what, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          const data = response.data.data;
          const res = [];
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            res.push([item.id, item.name, item.description || '', item._id, item.groups]);
          }
          return res;
        }
      })
  }

  delete(isAttribute, ids) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.delete(config.server + '/api/v2/' + what + '', {
      data: {ids: ids},
      withCredentials: axiosConfig.withCredentials
    })
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  assignGroups(isAttribute, data) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.post(`${config.server}/api/v2/${what}/assign/group`, data, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  generateId(isAttribute) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.get(`${config.server}/api/v2/${what}/generate/id`, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data.id;
        }
      })
  }

  /**
   * @param {boolean} isAttribute
   * @param labelName
   * @return {*}
   */
  getGroup(isAttribute, labelName = 'title') {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.get(`${config.server}/api/v2/${what}/group`, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
      .then(data => {
        return this._buildTree(data.documents, labelName);
      })
  }

  getAttributeGroup = () => this.getGroup(true);

  getCategoryGroup = () => this.getGroup(false);

  updateGroup(isAttribute, tree) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.post(`${config.server}/api/v2/${what}/group`, {documents: this._flatTree(tree)}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  updateAttributeGroup = (tree) => this.updateGroup(true, tree);

  updateCategoryGroup = (tree) => this.updateGroup(false, tree);

  removeGroup(isAttribute, _id) {
    const what = isAttribute ? 'attribute' : 'category';
    return axios.delete(`${config.server}/api/v2/${what}/group/${_id}`, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  removeAttributeGroup = (_id) => this.removeGroup(true, _id);

  removeCategoryGroup = (_id) => this.removeGroup(false, _id);

  /**
   * Generate a _id
   * @param {number} [number=1]
   * @return {Promise<AxiosResponse<T> | never>}
   */
  generateObjectId = generateObjectId;

  /**
   * Build group tree.
   * @param documents
   * @param labelName
   * @param [currNode]
   * @param [tree]
   * @param {Array} [childIds] - array of ids
   * @private
   */
  _buildTree(documents, labelName, currNode, tree = [], childIds) {
    // basis
    if (currNode == null) {
      for (let document of documents) {
        if (!document.parent) {
          // does not have parent, master node
          const node = {
            [labelName]: document.name,
            _id: document._id,
            children: []
          };
          tree.push(node);
          this._buildTree(documents, labelName, node, tree, document.children);
        }
      }
      return tree;
    } else {
      if (childIds.length === 0) return;
      for (let document of documents) {
        if (childIds.includes(document._id)) {
          const node = {
            [labelName]: document.name,
            _id: document._id,
            children: []
          };
          currNode.children.push(node);
          this._buildTree(documents, labelName, node, tree, document.children);
        }
      }
    }
  }

  _flatTree(tree, documents = [], currNode, currDocument) {
    // basis
    if (!currNode) {
      for (let node of tree) {
        const document = {
          _id: node._id,
          name: node.title,
          children: []
        };
        documents.push(document);
        this._flatTree(tree, documents, node, document);
      }
      return documents;
    } else {
      if (!currNode.children || currNode.children.length === 0) return;
      for (let node of currNode.children) {
        currDocument.children.push(node._id);
        const document = {
          _id: node._id,
          name: node.title,
          children: [],
          parent: currNode._id
        };
        documents.push(document);
        this._flatTree(tree, documents, node, document);
      }
    }

  }
}
