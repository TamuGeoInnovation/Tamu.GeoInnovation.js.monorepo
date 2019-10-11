<%@ Page Language="C#" Debug="true" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Security.Principal" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.ComponentModel" %>
<h1>Deploying!</h1>
<%
  Response.Write(@"User: " + System.Security.Principal.WindowsIdentity.GetCurrent().Name + @"<br/>");
  Process process = new Process();
  process.StartInfo.FileName = HttpRuntime.AppDomainAppPath + @"\deploy-test\test.bat";
  process.StartInfo.Arguments = Request.QueryString["sha"];
  process.StartInfo.UseShellExecute = false;
  process.StartInfo.RedirectStandardOutput = true;
  process.StartInfo.RedirectStandardError = true;
  process.StartInfo.CreateNoWindow = true;
  process.Start();
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
