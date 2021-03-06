/**
 * Copyright IBM Corp. 2020, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
/**
 * TODO: import action to handle events
 */
// import { action } from '@storybook/addon-actions';

import sectionTitle from '../../../config';

import { DISPLAY_NAME } from '.';

import page from './DISPLAY_NAME.mdx';
import styles from './_storybook-styles.scss';

const { name } = DISPLAY_NAME;

export default {
  title: `${sectionTitle}/${name}`,
  component: DISPLAY_NAME,
  // TODO: Define argTypes for props not represented by standard JS types
  // argTypes: {
  //   egProp: { control: 'color' },
  // },
  parameters: {
    docs: {
      page,
    },
    styles,
  },
};

/**
 * TODO: Declare template(s) that (one or more scenarios)
 */
const Template = (args) => {
  return (
    <DISPLAY_NAME
      {...args}
      // TODO: handle events with action or local handler
      // onTodo={action('onTodo log action')}
    />
  );
};

/**
 * TODO: Declare one or more examples per template.
 * NOTE: Complete list of examples should match designed use cases
 */
export const ExampleOne = Template.bind({});
ExampleOne.args = {
  // TODO: Component args - https://storybook.js.org/docs/react/writing-stories/args#DISPLAY_NAME-args
  children: name,
};
