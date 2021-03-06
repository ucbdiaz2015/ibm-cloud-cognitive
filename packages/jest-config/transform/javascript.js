/**
 * Copyright IBM Corp. 2020, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { createTransformer } = require('babel-jest');
const babelOptions = require('babel-preset-ibm-cloud-cognitive');

module.exports = createTransformer(babelOptions());
