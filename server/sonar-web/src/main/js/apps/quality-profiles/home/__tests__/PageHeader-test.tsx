/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { shallow } from 'enzyme';
import * as React from 'react';
import {
  mockLanguage,
  mockLocation,
  mockQualityProfile,
  mockRouter,
} from '../../../../helpers/testMocks';
import { click } from '../../../../helpers/testUtils';
import { PageHeader } from '../PageHeader';

it('should render correctly', () => {
  expect(shallowRender()).toMatchSnapshot();
  expect(shallowRender({ actions: { create: true } })).toMatchSnapshot();
  expect(shallowRender({ actions: { create: true }, languages: [] })).toMatchSnapshot();
});

it('should show a create form', () => {
  const wrapper = shallowRender({ actions: { create: true } });
  click(wrapper.find('#quality-profiles-create'));
  expect(wrapper).toMatchSnapshot();
});

it('should show a restore form', () => {
  const wrapper = shallowRender({ actions: { create: true } });
  click(wrapper.find('#quality-profiles-restore'));
  expect(wrapper).toMatchSnapshot();
});

function shallowRender(props: Partial<PageHeader['props']> = {}) {
  return shallow(
    <PageHeader
      actions={{ create: false }}
      languages={[mockLanguage()]}
      location={mockLocation()}
      profiles={[mockQualityProfile()]}
      router={mockRouter()}
      updateProfiles={jest.fn()}
      {...props}
    />
  );
}
