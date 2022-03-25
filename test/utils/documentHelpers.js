const { assert } = require('chai');

/**
 * Gets the page title element.
 * @param document
 * @return {*}
 */
const getPageTitle = (document) => {
  const element = document.getElementsByTagName('title')[0];
  assert.exists(element, 'Element with tag [title] was not found in DOM');
  return element;
};

/**
 * Gets the element by it's markup ID and asserts it is not null or undefined.
 * @param document
 * @param id
 * @return {*}
 */
const getElementById = (document, id) => {
  const element = document.getElementById(id);
  assert.exists(element, `Element with id [${id}] was not found in DOM`);
  return element;
};

/**
 * Returns the child at index from the element node.
 * @param element
 * @param childIndex
 * @return {*}
 */
const getChildNodeFromElement = (element, childIndex) => {
  const child = element.children[childIndex];
  assert.exists(child, `Child element at index [${childIndex}] was not found`);
  return child;
};

/**
 * Returns the Nodes with the tag passed in. E.g. `head`
 * @param document
 * @param tagName
 * @return {*}
 */
const getElementsByTagName = (document, tagName) => {
  const nodes = document.getElementsByTagName(tagName);
  assert(nodes.length > 0, `Nodes with tag [${tagName}] was not found in document`);
  return nodes;
};

module.exports = {
  getElementById,
  getChildNodeFromElement,
  getPageTitle,
  getElementsByTagName,
};
