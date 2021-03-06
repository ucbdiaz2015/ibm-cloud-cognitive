//
// Copyright IBM Corp. 2020, 2020
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import React from 'react';
import { mount } from 'enzyme';
import { IdeFilter } from '../IdeFilter';
import { options, untypedOptions } from './__fixtures__/options';

describe('IdeFilter', () => {
  it('Renders as expected', () => {
    const wrapper = mount(
      <IdeFilter
        options={options}
        light
        onChange={() => {}}
        placeholderText="Search..."
      />
    );
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.ide-filter--select').at(0).text()).toBe('Search...');
  });
  it('Renders options with filter tags by default', () => {
    const wrapper = mount(
      <IdeFilter
        options={untypedOptions}
        onChange={() => {}}
        value={[
          {
            label: options[0].options[0].label,
            value: options[0].options[0].value,
          },
        ]}
      />
    );
    expect(wrapper.find('.ide-filter--tag').at(0).props().type).toEqual(
      'filter'
    );
  });
  it('Renders options in menu', () => {
    const wrapper = mount(
      <IdeFilter options={options} menuIsOpen onChange={() => {}} />
    );
    wrapper.find('input').props().onFocus();
    expect(wrapper).toBeDefined();
    const optionLabels = wrapper
      .find('.ide-filter__option')
      .map((option) => option.text());
    let expectedOptionLabels = [];
    options.forEach((category) => {
      expectedOptionLabels = expectedOptionLabels.concat(
        category.options.map((option) => option.label)
      );
    });
    expectedOptionLabels.forEach((expectedOption) => {
      expect(optionLabels.includes(expectedOption)).toBe(true);
    });
  });
  it('Triggers on change', () => {
    const changeSpy = jest.fn();
    const wrapper = mount(
      <IdeFilter options={options} menuIsOpen onChange={changeSpy} />
    );
    wrapper.find('.ide-filter__option').at(0).props().onClick();
    expect(changeSpy).toHaveBeenCalledWith([options[0].options[0]], {
      action: 'select-option',
      name: undefined,
      option: options[0].options[0],
    });
  });
  it('Triggers on input change', () => {
    const changeSpy = jest.fn();
    const inputChangeSpy = jest.fn();
    const wrapper = mount(
      <IdeFilter
        options={options}
        menuIsOpen
        onChange={changeSpy}
        onInputChange={inputChangeSpy}
      />
    );
    const input = wrapper.find('input');
    input.instance().value = 'my new value';
    input.simulate('change');
    expect(inputChangeSpy).toHaveBeenCalledWith('my new value', {
      action: 'input-change',
    });
  });
  it('Creates new options', () => {
    const changeSpy = jest.fn();
    const wrapper = mount(
      <IdeFilter
        options={options}
        inputValue={'something'}
        onChange={changeSpy}
      />
    );
    wrapper
      .find('input')
      .simulate('change', { target: { value: 'something' } });
    expect(wrapper.find('.ide-filter__option').at(0).text()).toEqual(
      'Search for "something"'
    );
    wrapper.find('.ide-filter__option').at(0).props().onClick();
    const expectedOption = {
      label: 'Search for "something"',
      value: 'something',
      __plaintext__: true,
    };
    expect(changeSpy).toHaveBeenCalledWith([expectedOption], {
      action: 'select-option',
      name: undefined,
      option: expectedOption,
    });
  });
  it('isLoading passed to component', () => {
    const isLoading = true;
    const wrapper = mount(
      <IdeFilter options={options} menuIsOpen isLoading={isLoading} />
    );
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().isLoading).toEqual(true);
  });
  it('isLoading false by default', () => {
    const wrapper = mount(<IdeFilter options={options} menuIsOpen />);
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().isLoading).toEqual(false);
  });
  it('allowCreateWhileLoading passed to component', () => {
    const allowCreateWhileLoading = false;
    const wrapper = mount(
      <IdeFilter
        options={options}
        menuIsOpen
        allowCreateWhileLoading={allowCreateWhileLoading}
      />
    );
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().allowCreateWhileLoading).toEqual(false);
  });
  it('allowCreateWhileLoading true by default', () => {
    const wrapper = mount(<IdeFilter options={options} menuIsOpen />);
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().allowCreateWhileLoading).toEqual(true);
  });
  it('loadingMessage passed to component', () => {
    const loadingMessage = jest.fn();
    const wrapper = mount(
      <IdeFilter options={options} menuIsOpen loadingMessage={loadingMessage} />
    );
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().loadingMessage).toBe(loadingMessage);
  });
  it('searchForText passed to component', () => {
    const wrapper = mount(
      <IdeFilter options={options} menuIsOpen searchForText={'custom text'} />
    );
    const select = wrapper.find('.ide-filter--select').at(0);
    expect(select.props().formatCreateLabel()).toContain('custom text');
  });
});
