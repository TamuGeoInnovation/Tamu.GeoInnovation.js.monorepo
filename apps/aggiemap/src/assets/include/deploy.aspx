<%@ Page Language="C#" Debug="true" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Security.Principal" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.ComponentModel" %>
<%@ Import Namespace="System.Text.RegularExpressions" %>
<%@ Import Namespace="System.Net" %>

<h1>Deploying!</h1>
<%
  Response.Write(@"User: " + System.Security.Principal.WindowsIdentity.GetCurrent().Name + @"<br/>");

  string archive_dir = @"\Windows\Temp\aggiemap-deploy";
  string archive_location = archive_dir + @"\aggiemap.zip";
  string unzip_dir = archive_dir + @"\aggiemap";

  using (WebClient wc = new WebClient()) {
    string json = wc.DownloadString("https://circleci.com/api/v1.1/project/gh/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/" + Request.QueryString["build_number"] + "/artifacts);

    string pattern = "\"(https.*)\"";
    Match m = Regex.Match(json, pattern);
    if (!m.Success) {
      return;
    }

    Directory.CreateDirectory(archive_dir);
    wc.DownloadFile(m.Value.Replace("\"", ""), archive_location);
  }

  if (!Directory.Exists(unzip_dir)) {
    Directory.CreateDirectory(unzip_dir);
  }

  Process process = new Process();
  process.StartInfo.FileName = "CMD.exe";
  process.StartInfo.Arguments = @"unzip -o " + archive_location;
  process.StartInfo.UseShellExecute = false;
  process.StartInfo.RedirectStandardOutput = true;
  process.StartInfo.RedirectStandardError = true;
  process.StartInfo.CreateNoWindow = true;
  process.Start(); // TODO It hangs here ??

  // TODO copy files to C:\inetpub\wwwroot\aggiemap-dev\
%>
<h3>Output:</h3>
<%
  while (!process.StandardOutput.EndOfStream) {
      Response.Write(process.StandardOutput.ReadLine() + @"<br/>");
  }
%>
<h3>Errors:</h3>
<%
  while (!process.StandardError.EndOfStream) {
      Response.Write(process.StandardError.ReadLine() + @"<br/>");
  }
%>
