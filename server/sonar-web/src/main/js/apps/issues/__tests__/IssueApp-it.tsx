/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
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
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import IssuesServiceMock from '../../../api/mocks/IssuesServiceMock';
import { renderOwaspTop102021Category } from '../../../helpers/security-standard';
import { mockCurrentUser } from '../../../helpers/testMocks';
import { renderApp, renderAppRoutes } from '../../../helpers/testReactTestingUtils';
import { IssueType } from '../../../types/issues';
import { CurrentUser } from '../../../types/users';
import IssuesApp from '../components/IssuesApp';
import { projectIssuesRoutes } from '../routes';

jest.mock('../../../api/issues');
jest.mock('../../../api/rules');
jest.mock('../../../api/components');
jest.mock('../../../api/users');

let handler: IssuesServiceMock;

beforeEach(() => {
  handler = new IssuesServiceMock();
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

it('should show education principles', async () => {
  const user = userEvent.setup();
  renderProjectIssuesApp('project/issues?issues=issue2&open=issue2&id=myproject');
  await user.click(
    await screen.findByRole('button', { name: `coding_rules.description_section.title.more_info` })
  );
  expect(screen.getByRole('heading', { name: 'Defense-In-Depth', level: 3 })).toBeInTheDocument();
});

it('should open issue and navigate', async () => {
  const user = userEvent.setup();

  renderIssueApp(mockCurrentUser());

  // Select an issue with an advanced rule
  expect(await screen.findByRole('region', { name: 'Fix that' })).toBeInTheDocument();
  await user.click(screen.getByRole('region', { name: 'Fix that' }));
  expect(screen.getByRole('button', { name: 'issue.tabs.code' })).toBeInTheDocument();

  // Are rule headers present?
  expect(screen.getByRole('heading', { level: 1, name: 'Fix that' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'advancedRuleId' })).toBeInTheDocument();

  // Select the "why is this an issue" tab and check its content
  expect(
    screen.getByRole('button', { name: `coding_rules.description_section.title.root_cause` })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: `coding_rules.description_section.title.root_cause` })
  );
  expect(screen.getByRole('heading', { name: 'Because' })).toBeInTheDocument();

  // Select the "how to fix it" tab
  expect(
    screen.getByRole('button', { name: `coding_rules.description_section.title.how_to_fix` })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: `coding_rules.description_section.title.how_to_fix` })
  );

  // Is the context selector present with the expected values and default selection?
  expect(screen.getByRole('button', { name: 'Context 2' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Context 3' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Spring' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'coding_rules.description_context.other' })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Spring' })).toHaveClass('selected');

  // Select context 2 and check tab content
  await user.click(screen.getByRole('button', { name: 'Context 2' }));
  expect(screen.getByText('Context 2 content')).toBeInTheDocument();

  // Select the "other" context and check tab content
  await user.click(screen.getByRole('button', { name: 'coding_rules.description_context.other' }));
  expect(screen.getByText('coding_rules.context.others.title')).toBeInTheDocument();
  expect(screen.getByText('coding_rules.context.others.description.first')).toBeInTheDocument();
  expect(screen.getByText('coding_rules.context.others.description.second')).toBeInTheDocument();

  // Select the main info tab and check its content
  expect(
    screen.getByRole('button', { name: `coding_rules.description_section.title.more_info` })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: `coding_rules.description_section.title.more_info` })
  );
  expect(screen.getByRole('heading', { name: 'Link' })).toBeInTheDocument();

  // check for extended description
  const extendedDescriptions = screen.getAllByText('Extended Description');
  expect(extendedDescriptions).toHaveLength(1);

  // Select the previous issue (with a simple rule) through keyboard shortcut
  await user.keyboard('{ArrowUp}');

  // Are rule headers present?
  expect(screen.getByRole('heading', { level: 1, name: 'Fix this' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'simpleRuleId' })).toBeInTheDocument();

  // Select the "why is this an issue tab" and check its content
  expect(
    screen.getByRole('button', { name: `coding_rules.description_section.title.root_cause` })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: `coding_rules.description_section.title.root_cause` })
  );
  expect(screen.getByRole('heading', { name: 'Default' })).toBeInTheDocument();

  // Select the previous issue (with a simple rule) through keyboard shortcut
  await user.keyboard('{ArrowUp}');

  // Are rule headers present?
  expect(screen.getByRole('heading', { level: 1, name: 'Issue on file' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'simpleRuleId' })).toBeInTheDocument();

  // The "Where is the issue" tab should be selected by default. Check its content
  expect(screen.getByRole('region', { name: 'Issue on file' })).toBeInTheDocument();
  expect(
    screen.getByRole('row', {
      name: '2 source_viewer.tooltip.covered import java.util. ArrayList ;'
    })
  ).toBeInTheDocument();
});

it('should be able to navigate to other issue located in the same file', async () => {
  const user = userEvent.setup();
  renderIssueApp();
  await user.click(await screen.findByRole('region', { name: 'Fix that' }));
  expect(await screen.findByRole('region', { name: 'Second issue' })).toBeInTheDocument();
  await user.click(await screen.findByRole('region', { name: 'Second issue' }));
  expect(screen.getByRole('heading', { level: 1, name: 'Second issue' })).toBeInTheDocument();
});

it('should support OWASP Top 10 version 2021', async () => {
  const user = userEvent.setup();
  renderIssueApp();
  await user.click(await screen.findByRole('link', { name: 'issues.facet.standards' }));
  const owaspTop102021 = screen.getByRole('link', { name: 'issues.facet.owaspTop10_2021' });
  expect(owaspTop102021).toBeInTheDocument();

  await user.click(owaspTop102021);
  await Promise.all(
    handler.owasp2021FacetList().values.map(async ({ val }) => {
      const standard = await handler.getStandards();
      /* eslint-disable-next-line testing-library/render-result-naming-convention */
      const linkName = renderOwaspTop102021Category(standard, val);
      expect(await screen.findByRole('link', { name: linkName })).toBeInTheDocument();
    })
  );
});

it('should be able to perform action on issues', async () => {
  const user = userEvent.setup();
  handler.setIsAdmin(true);
  renderIssueApp();

  // Select an issue with an advanced rule
  await user.click(await screen.findByRole('region', { name: 'Fix that' }));

  // changing issue type
  expect(
    screen.getByRole('button', {
      name: `issue.type.type_x_click_to_change.issue.type.CODE_SMELL`
    })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', {
      name: `issue.type.type_x_click_to_change.issue.type.CODE_SMELL`
    })
  );
  expect(screen.getByText('issue.type.BUG')).toBeInTheDocument();
  expect(screen.getByText('issue.type.VULNERABILITY')).toBeInTheDocument();

  await user.click(screen.getByText('issue.type.VULNERABILITY'));
  expect(
    screen.getByRole('button', {
      name: `issue.type.type_x_click_to_change.issue.type.VULNERABILITY`
    })
  ).toBeInTheDocument();

  // changing issue severity
  expect(screen.getByText('severity.MAJOR')).toBeInTheDocument();

  await user.click(
    screen.getByRole('button', {
      name: `issue.severity.severity_x_click_to_change.severity.MAJOR`
    })
  );
  expect(screen.getByText('severity.MINOR')).toBeInTheDocument();
  expect(screen.getByText('severity.INFO')).toBeInTheDocument();
  await user.click(screen.getByText('severity.MINOR'));
  expect(
    screen.getByRole('button', {
      name: `issue.severity.severity_x_click_to_change.severity.MINOR`
    })
  ).toBeInTheDocument();

  // changing issue status
  expect(screen.getByText('issue.status.OPEN')).toBeInTheDocument();

  await user.click(screen.getByText('issue.status.OPEN'));
  expect(screen.getByText('issue.transition.confirm')).toBeInTheDocument();
  expect(screen.getByText('issue.transition.resolve')).toBeInTheDocument();

  await user.click(screen.getByText('issue.transition.confirm'));
  expect(
    screen.getByRole('button', {
      name: `issue.transition.status_x_click_to_change.issue.status.CONFIRMED`
    })
  ).toBeInTheDocument();

  // As won't fix
  await user.click(screen.getByText('issue.status.CONFIRMED'));
  await user.click(screen.getByText('issue.transition.wontfix'));
  // Comment should open and close
  expect(screen.getByRole('button', { name: 'issue.comment.submit' })).toBeInTheDocument();
  await user.keyboard('test');
  await user.click(screen.getByRole('button', { name: 'issue.comment.submit' }));
  expect(screen.queryByRole('button', { name: 'issue.comment.submit' })).not.toBeInTheDocument();

  // assigning issue to a different user
  expect(
    screen.getByRole('button', {
      name: `issue.assign.unassigned_click_to_assign`
    })
  ).toBeInTheDocument();

  await user.click(
    screen.getByRole('button', {
      name: `issue.assign.unassigned_click_to_assign`
    })
  );
  expect(screen.getByRole('searchbox', { name: 'search_verb' })).toBeInTheDocument();

  await user.click(screen.getByRole('searchbox', { name: 'search_verb' }));
  await user.keyboard('luke');
  expect(screen.getByText('Skywalker')).toBeInTheDocument();
  await user.keyboard('{ArrowUp}{enter}');
  expect(screen.getByText('luke')).toBeInTheDocument();

  // adding comment to the issue
  expect(
    screen.getByRole('button', {
      name: `issue.comment.add_comment`
    })
  ).toBeInTheDocument();

  await user.click(
    screen.getByRole('button', {
      name: `issue.comment.add_comment`
    })
  );
  expect(screen.getByText('issue.comment.submit')).toBeInTheDocument();
  await user.keyboard('comment');
  await user.click(screen.getByText('issue.comment.submit'));
  expect(screen.getByText('comment')).toBeInTheDocument();

  // Cancel editing the comment
  expect(screen.getByRole('button', { name: 'issue.comment.edit' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'issue.comment.edit' }));
  await user.keyboard('New ');
  await user.click(screen.getByRole('button', { name: 'issue.comment.edit.cancel' }));
  expect(screen.queryByText('New comment')).not.toBeInTheDocument();

  // editing the comment
  expect(screen.getByRole('button', { name: 'issue.comment.edit' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'issue.comment.edit' }));
  await user.keyboard('New ');
  await user.click(screen.getByText('save'));
  expect(screen.getByText('New comment')).toBeInTheDocument();

  // deleting the comment
  expect(screen.getByRole('button', { name: 'issue.comment.delete' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'issue.comment.delete' }));
  expect(screen.queryByText('New comment')).not.toBeInTheDocument();

  // adding comment using keyboard
  await user.click(screen.getByRole('textbox'));
  await user.keyboard('comment');
  await user.keyboard('{Control>}{enter}{/Control}');
  expect(screen.getByText('comment')).toBeInTheDocument();

  // editing the comment using keyboard
  await user.click(screen.getByRole('button', { name: 'issue.comment.edit' }));
  await user.keyboard('New ');
  await user.keyboard('{Control>}{enter}{/Control}');
  expect(screen.getByText('New comment')).toBeInTheDocument();

  // changing tags
  expect(screen.getByText('issue.no_tag')).toBeInTheDocument();
  await user.click(screen.getByText('issue.no_tag'));
  expect(screen.getByRole('searchbox', { name: 'search_verb' })).toBeInTheDocument();
  expect(screen.getByText('android')).toBeInTheDocument();
  expect(screen.getByText('accessibility')).toBeInTheDocument();

  await user.click(screen.getByText('accessibility'));
  await user.click(screen.getByText('android'));
  expect(screen.getByTitle('accessibility, android')).toBeInTheDocument();

  // Unslect
  await user.click(screen.getByText('accessibility'));
  expect(screen.getByTitle('android')).toBeInTheDocument();

  await user.click(screen.getByRole('searchbox', { name: 'search_verb' }));
  await user.keyboard('addNewTag');
  expect(screen.getByText('+')).toBeInTheDocument();
  expect(screen.getByText('addnewtag')).toBeInTheDocument();
});

it('should not allow performing actions when user does not have permission', async () => {
  const user = userEvent.setup();
  renderIssueApp();

  await user.click(await screen.findByRole('region', { name: 'Fix this' }));

  expect(
    screen.queryByRole('button', {
      name: `issue.assign.unassigned_click_to_assign`
    })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', {
      name: `issue.type.type_x_click_to_change.issue.type.CODE_SMELL`
    })
  ).not.toBeInTheDocument();

  await user.click(
    screen.getByRole('button', {
      name: `issue.comment.add_comment`
    })
  );
  expect(screen.queryByRole('button', { name: 'issue.comment.submit' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', {
      name: `issue.transition.status_x_click_to_change.issue.status.OPEN`
    })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', {
      name: `issue.severity.severity_x_click_to_change.severity.MAJOR`
    })
  ).not.toBeInTheDocument();
});

it('should open the actions popup using keyboard shortcut', async () => {
  const user = userEvent.setup();
  handler.setIsAdmin(true);
  renderIssueApp();

  // Select an issue with an advanced rule
  await user.click(await screen.findByRole('region', { name: 'Fix that' }));

  // open severity popup on key press 'i'
  await user.keyboard('i');
  expect(screen.getByText('severity.MINOR')).toBeInTheDocument();
  expect(screen.getByText('severity.INFO')).toBeInTheDocument();

  // open status popup on key press 'f'
  await user.keyboard('f');
  expect(screen.getByText('issue.transition.confirm')).toBeInTheDocument();
  expect(screen.getByText('issue.transition.resolve')).toBeInTheDocument();

  // open comment popup on key press 'c'
  await user.keyboard('c');
  expect(screen.getByText('issue.comment.submit')).toBeInTheDocument();
  await user.click(screen.getByText('cancel'));

  // open tags popup on key press 't'
  await user.keyboard('t');
  expect(screen.getByRole('searchbox', { name: 'search_verb' })).toBeInTheDocument();
  expect(screen.getByText('android')).toBeInTheDocument();
  expect(screen.getByText('accessibility')).toBeInTheDocument();
  // closing tags popup
  await user.click(screen.getByText('issue.no_tag'));

  // open assign popup on key press 'a'
  await user.keyboard('a');
  expect(screen.getByRole('searchbox', { name: 'search_verb' })).toBeInTheDocument();
});

describe('redirects', () => {
  it('should work for hotspots', () => {
    renderProjectIssuesApp(`project/issues?types=${IssueType.SecurityHotspot}`);

    expect(screen.getByText('/security_hotspots?assignedToMe=false')).toBeInTheDocument();
  });

  it('should filter out hotspots', async () => {
    renderProjectIssuesApp(
      `project/issues?types=${IssueType.SecurityHotspot},${IssueType.CodeSmell}`
    );

    expect(
      await screen.findByRole('link', { name: `issue.type.${IssueType.CodeSmell}` })
    ).toBeInTheDocument();
  });
});

function renderIssueApp(currentUser?: CurrentUser) {
  renderApp('project/issues', <IssuesApp />, { currentUser: mockCurrentUser(), ...currentUser });
}

function renderProjectIssuesApp(navigateTo?: string) {
  renderAppRoutes('project/issues', projectIssuesRoutes, { navigateTo });
}
