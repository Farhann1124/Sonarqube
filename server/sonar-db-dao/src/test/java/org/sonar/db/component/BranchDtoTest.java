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
package org.sonar.db.component;

import org.junit.Test;
import org.sonar.db.protobuf.DbProjectBranches;

import static org.assertj.core.api.Assertions.assertThat;

public class BranchDtoTest {

  private final BranchDto underTest = new BranchDto();

  @Test
  public void isMain_is_true_if_branch_uuid_equals_project_uuid() {
    underTest.setProjectUuid("U1");
    underTest.setUuid("U1");

    assertThat(underTest.isMain()).isTrue();
  }

  @Test
  public void isMain_is_false_if_branch_uuid_does_not_equal_project_uuid() {
    underTest.setProjectUuid("U1");
    underTest.setUuid("U2");

    assertThat(underTest.isMain()).isFalse();
  }

  @Test
  public void verify_equals() {
    underTest.setUuid("U1");
    underTest.setProjectUuid("U2");
    underTest.setKey("K1");
    underTest.setBranchType(BranchType.BRANCH);
    underTest.setMergeBranchUuid("U3");
    underTest.setExcludeFromPurge(true);

    assertThat(underTest).hasToString("BranchDto{uuid='U1', " +
      "projectUuid='U2', kee='K1', branchType=BRANCH, mergeBranchUuid='U3', excludeFromPurge=true, needIssueSync=false}");
  }

  @Test
  public void verify_toString() {
    underTest.setUuid("U1");
    underTest.setProjectUuid("U2");
    underTest.setKey("K1");
    underTest.setBranchType(BranchType.BRANCH);
    underTest.setMergeBranchUuid("U3");

    BranchDto toCompare = new BranchDto();

    toCompare.setUuid("U1");
    toCompare.setProjectUuid("U2");
    toCompare.setKey("K1");
    toCompare.setBranchType(BranchType.BRANCH);
    toCompare.setMergeBranchUuid("U3");

    assertThat(underTest).isEqualTo(toCompare);
  }

  @Test
  public void encode_and_decode_pull_request_data() {
    String branch = "feature/pr1";
    String title = "Dummy Feature Title";
    String url = "http://example.com/pullRequests/pr1";

    DbProjectBranches.PullRequestData pullRequestData = DbProjectBranches.PullRequestData.newBuilder()
      .setBranch(branch)
      .setTitle(title)
      .setUrl(url)
      .build();

    underTest.setPullRequestData(pullRequestData);

    DbProjectBranches.PullRequestData decoded = underTest.getPullRequestData();
    assertThat(decoded).isNotNull();
    assertThat(decoded.getBranch()).isEqualTo(branch);
    assertThat(decoded.getTitle()).isEqualTo(title);
    assertThat(decoded.getUrl()).isEqualTo(url);
  }

  @Test
  public void getPullRequestData_returns_null_when_data_is_null() {
    assertThat(underTest.getPullRequestData()).isNull();
  }
}
