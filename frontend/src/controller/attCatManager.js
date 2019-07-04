import axios from "axios";
import config from "./../config/config";

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

  addCategory(category) {
    return axios.post(config.server + '/api/add-cat', {category}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  addAttribute(attribute) {
    return axios.post(config.server + '/api/add-att', {attribute}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  add(what, newValue) {
    if (what === 'att')
      return this.addAttribute(newValue);
    else if (what === 'cat')
      return this.addCategory(newValue);
    else {
      throw new Error('first parameter must be att or cat');
    }
  }

  getAttributes() {
    return axios.get(config.server + '/api/attributes', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          const atts = response.data.attributes;
          const res = [];
          for (let i = 0; i < atts.length; i++) {
            res.push([atts[i].id, atts[i].attribute, atts[i].description]);
          }
          return res;

        }
      })
  }

  getCategories() {
    return axios.get(config.server + '/api/categories', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          const cats = response.data.categories;
          const res = [];
          for (let i = 0; i < cats.length; i++) {
            res.push([cats[i].id, cats[i].category, cats[i].description]);
          }
          return res;
        }
      })
  }

  /**
   *
   * @param {'att'|'cat'} what
   * @return {*}
   */
  get(what) {
    if (what === 'att')
      return this.getAttributes();
    else if (what === 'cat')
      return this.getCategories();
    else {
      throw new Error('first parameter must be att or cat');
    }
  }

  delete(what, ids) {
    return axios.delete(config.server + '/api/' + what + 's/delete', {
      data: {ids: ids},
      withCredentials: axiosConfig.withCredentials
    })
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  getAttributeGroup() {
    return axios.get(config.server + '/api/v2/attribute/group', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
      .then(data => {
        return this._buildTree(data.documents);
      })
  }

  updateAttributeGroup(tree) {
    return axios.post(config.server + '/api/v2/attribute/group', {documents: this._flatTree(tree)}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  removeAttributeGroup(_id) {
    return axios.delete(config.server + '/api/v2/attribute/group/' + _id, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  /**
   * Generate a _id
   * @param {number} [number=1]
   * @return {Promise<AxiosResponse<T> | never>}
   */
  generateId(number = 1) {
    return axios.get(config.server + '/api/v2/generate/id/' + number, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      });
  }

  /**
   * Build group tree.
   * @param documents
   * @param [currNode]
   * @param [tree]
   * @param {Array} [childIds] - array of ids
   * @private
   */
  _buildTree(documents, currNode, tree = [], childIds) {
    // basis
    if (currNode == null) {
      for (let document of documents) {
        if (!document.parent) {
          // does not have parent, master node
          const node = {
            title: document.name,
            _id: document._id,
            children: []
          };
          tree.push(node);
          this._buildTree(documents, node, tree, document.children);
        }
      }
      return tree;
    } else {
      if (childIds.length === 0) return;
      for (let document of documents) {
        if (childIds.includes(document._id)) {
          const node = {
            title: document.name,
            _id: document._id,
            children: []
          };
          currNode.children.push(node)
          this._buildTree(documents, node, tree, document.children);
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
