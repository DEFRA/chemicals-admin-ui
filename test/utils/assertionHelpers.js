const { getElementById } = require('./documentHelpers');
const { JSDOM } = require('jsdom');
const { expect, assert } = require('chai');
const _ = require('lodash');

/**
 * Performs HTML encoding of special characters (i.e. punctuation or other
 * characters that may be interpreted incorrectly in HTML unless encoded).
 *
 * @param text the text to encode.
 * @returns encoded text (or original text if text does not contain any special
 * characters).
 */
const encodeSpecialChars = (text) => {
  if (text && typeof text === 'string') {
    text = text.replace(/'/gmi, '&#x27;');
  }

  return text;
};

/**
 * Asserts that provided source contains specified text. Also asserts that
 * specified text is not null.
 *
 * @param source the source text.
 * @param text the text that is required to be present in source text.
 */
const assertContainsText = (source, text) => {
  expect(text).to.be.a('string');
  expect(text.length).to.be.above(0, `Text: ${text}`);

  expect(encodeSpecialChars(source)).to.contain(encodeSpecialChars(text), `expected text [${text}] was not found in source.`);
};

/**
 * Asserts that provided source does not contain specified text. Also asserts
 * that specified text is not null.
 *
 * @param source the source text.
 * @param text the text that must not be present in source text.
 */
const assertExcludesText = (source, text) => {
  expect(text).to.be.a('string');
  expect(text.length).to.be.above(0);

  expect(source).to.not.contain(encodeSpecialChars(text), `unexpected [${text}] was found in source.`);
};

/**
 * Asserts that the provided element is on the page.
 * @param document the document for which to check.
 * @param elementId the id of the element that should be on the page.
 */
const assertElementOnPage = (document, elementId) => {
  expect(document.getElementById(elementId)).to.not.be.a('null');
};

/**
 * Asserts that the provided element is not on the page.
 * @param document the document for which to check.
 * @param elementId the id of the element that should not be on the page.
 */
const assertElementNotOnPage = (document, elementId) => {
  expect(document.getElementById(elementId)).to.be.a('null');
};

/**
 * Asserts that a nock HTTP mock call has been executed and is complete.
 *
 * @param scope a nock scope for which confirmation of execution and
 * completion is required.
 */
const verifyHTTPMock = (scope) => {
  expect(scope.isDone()).to.equal(true, 'An HTTP mock has not executed.');
};

/**
 * Asserts that one or more nock HTTP mock calls have been executed and are complete.
 *
 * @param scopes an array of nock scopes for which confirmation of execution and
 * completion is required.
 */
const verifyHTTPMocks = (scopes) => {
  scopes.forEach((scope) => {
    verifyHTTPMock(scope);
  });
};

/**
 * Asserts equal check between the given 'expected' and 'actual' values
 * @param expected
 * @param actual
 */
const assertEqualsCheck = (expected, actual) => {
  expect(actual).to.equal(expected);
};

const assert404 = (response) => {
  assert(response.status, 404);
};

/**
 * Asserts text on a element node is correct
 * @param document
 * @param assertText
 * @param elementId
 */
const assertTextOnElementNode = (document, assertText, elementId) => {
  const element = getElementById(document, elementId);
  assertContainsText(element.textContent, assertText);
};

/**
 * Asserts text is not on a element node
 * @param document
 * @param assertText
 * @param elementId
 */
const assertTextNotOnElementNode = (document, assertText, elementId) => {
  const element = getElementById(document, elementId);
  assertExcludesText(element.textContent, assertText);
};

/**
 * Asserts text on a element node in an array is correct
 * @param elementArray
 * @param position
 * @param assertText
 */
const assertTextOnElementNodeInArray = (elementArray, position, assertText) => {
  const element = elementArray[position];
  assertContainsText(element.textContent, assertText);
};

const assertPageTitle = (document, expectedPageTitle) => {
  const element = document.getElementsByTagName('title')[0];
  assertContainsText(element.innerHTML, expectedPageTitle);
};

/**
 * Asserts value on a element node is correct
 * @param document containing the dom
 * @param assertText expected text
 * @param elementId element id
 */
const assertValueOnElementNode = (document, assertText, elementId) => {
  const element = getElementById(document, elementId);
  assertContainsText(element.value, assertText);
};

/**
 * Asserts text on a series of element nodes
 * @param document the document to assert
 * @param assertions - an object containing mapping from elementId to
 *        expected text = e.g. {'tableSubstanceNameHeader':'some header'}
 */
const assertTextsOnElementNodes = (document, assertions) => {
  _.forOwn(assertions, (assertText, elementId) =>
    assertTextOnElementNode(document, assertText, elementId));
};

const assertElementValue = (response, elementId, expectedValue) => {
  const { document } = new JSDOM(response.text).window;

  const element = getElementById(document, elementId);
  const actual = encodeSpecialChars(element.innerHTML);
  expect(actual).to.contain(expectedValue);
};

const assertElementContainsValue = (document, containsValue, elementId) => {
  expect(getElementById(document, elementId).innerHTML).to.contain(containsValue);
};

/**
 * Asserts the 'value' attribute for the element passed in.
 * @param element
 * @param attribute
 * @param expectedValue
 */
const assertAttributeForElement = (element, attribute, expectedValue) => {
  const actual = encodeSpecialChars(element.getAttribute(attribute));
  expect(actual).to.equal(expectedValue);
};

const assertHrefValueOnElementNode = (document, assertText, elementId) => {
  const element = getElementById(document, elementId);
  assertAttributeForElement(element, 'href', assertText);
};

const assertClassOnElementNode = (document, htmlClass, elementId) => {
  const element = getElementById(document, elementId);
  expect(element.classList.contains(htmlClass)).to.be.true;
};

module.exports = {
  encodeSpecialChars,
  assertContainsText,
  assertExcludesText,
  assertElementOnPage,
  assertElementNotOnPage,
  verifyHTTPMocks,
  assertEqualsCheck,
  assert404,
  assertValueOnElementNode,
  assertPageTitle,
  assertTextOnElementNode,
  assertTextNotOnElementNode,
  assertTextOnElementNodeInArray,
  assertTextsOnElementNodes,
  assertElementValue,
  assertAttributeForElement,
  assertElementContainsValue,
  assertHrefValueOnElementNode,
  assertClassOnElementNode,
};
