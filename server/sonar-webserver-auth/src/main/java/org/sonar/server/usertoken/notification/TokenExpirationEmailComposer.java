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
package org.sonar.server.usertoken.notification;

import java.net.MalformedURLException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.sonar.api.config.EmailSettings;
import org.sonar.db.user.UserTokenDto;
import org.sonar.server.email.EmailSender;

import static java.lang.String.format;
import static org.sonar.db.user.TokenType.PROJECT_ANALYSIS_TOKEN;

public class TokenExpirationEmailComposer extends EmailSender<TokenExpirationEmail> {

  protected TokenExpirationEmailComposer(EmailSettings emailSettings) {
    super(emailSettings);
  }

  @Override protected void addReportContent(HtmlEmail email, TokenExpirationEmail emailData) throws EmailException, MalformedURLException {
    email.addTo(emailData.getRecipients().toArray(String[]::new));
    UserTokenDto token = emailData.getUserToken();
    if (token.isExpired()) {
      email.setSubject(format("Your token with name \"%s\" has expired.", token.getName()));
    } else {
      email.setSubject(format("Your token with name \"%s\" will expire on %s.", token.getName(), parseDate(token.getExpirationDate())));
    }
    email.setHtmlMsg(composeEmailBody(token));
  }

  private String composeEmailBody(UserTokenDto token) {
    StringBuilder builder = new StringBuilder();
    builder.append("Token Summary<br/><br/>")
      .append(format("Name: %s<br/>", token.getName()))
      .append(format("Type: %s<br/>", token.getType()));
    if (PROJECT_ANALYSIS_TOKEN.name().equals(token.getType())) {
      builder.append(format("Project: %s<br/>", token.getProjectName()));
    }
    builder.append(format("Created on: %s<br/>", parseDate(token.getCreatedAt())));
    if (token.getLastConnectionDate() != null) {
      builder.append(format("Last used on: %s<br/>", parseDate(token.getLastConnectionDate())));
    }
    builder.append(format("%s on: %s<br/>", token.isExpired() ? "Expired" : "Expires", parseDate(token.getExpirationDate())))
      .append(format("<br/>If this token is still needed, visit <a href=\"%s/account/security/\">here</a> to generate an equivalent.", emailSettings.getServerBaseURL()));
    return builder.toString();
  }

  private static String parseDate(long timestamp) {
    return Instant.ofEpochMilli(timestamp).atZone(ZoneOffset.UTC).toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
  }
}
