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
package org.sonar.server.platform.db.migration.version.v91;

import java.sql.SQLException;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.db.CoreDbTester;

public class CreateIndexForIssueChangesOnIssueKeyAndChangeTypeTest {
  private final static String TABLE_NAME = "issue_changes";
  private final static String INDEX_NAME = "issue_changes_issue_key_type";

  @Rule
  public final CoreDbTester db = CoreDbTester.createForSchema(CreateIndexForIssueChangesOnIssueKeyAndChangeTypeTest.class, "schema.sql");

  private final CreateIndexForIssueChangesOnIssueKeyAndChangeType underTest = new CreateIndexForIssueChangesOnIssueKeyAndChangeType(db.database());

  @Test
  public void should_create_index() throws SQLException {
    db.assertIndexDoesNotExist(TABLE_NAME, INDEX_NAME);
    underTest.execute();
    db.assertIndex(TABLE_NAME, INDEX_NAME, "issue_key", "change_type");
  }

  @Test
  public void migration_should_be_reentrant() throws SQLException {
    db.assertIndexDoesNotExist(TABLE_NAME, INDEX_NAME);

    underTest.execute();
    //re-entrant
    underTest.execute();

    db.assertIndex(TABLE_NAME, INDEX_NAME, "issue_key", "change_type");
  }
}
