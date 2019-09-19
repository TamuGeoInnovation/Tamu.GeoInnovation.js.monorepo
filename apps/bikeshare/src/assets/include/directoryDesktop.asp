<div class="dirheadingd">This is a list of all buildings in our database that have both a name and a building number.</div>
<div id=dirbodydt><table width="100%"><tr>
<%
strConnection = "DRIVER={SQL Server};SERVER=fc-sql.tamu.edu,1435;UID=AggieMap_user;PWD=AggieMap_Pass;DATABASE=AggieMap.tamu.edu"
Set Connection = Server.CreateObject("ADODB.Connection")
Set Recordset = Server.CreateObject("ADODB.Recordset")
Connection.Open strConnection
strSQL = "SELECT Bldg as Number, BldgAbbr as Abbrev, BldgName as Name FROM [OFC].[DBO].[MainBldgRecord] WHERE (BldgName IS NOT NULL) AND (StatusCode = 1) AND (Bldg in (SELECT number FROM [AggieMap.tamu.edu].[dbo].[Building_Geometry])) ORDER BY Name, Abbrev, Number"
Recordset.Open strSQL,Connection
DO While Not Recordset.EOF
	if (trim(Recordset("abbrev")) <> "") THEN
		strName = trim(Recordset("Name")) & " (" & trim(Recordset("abbrev")) & ")"
	else
		strName = trim(Recordset("name"))
	end if
	Response.Write "<td width=20>&nbsp;</td><td><a href=/?bldg=" & trim(Recordset("Number")) & ">" & strName & "</a></td></tr>"

Recordset.MoveNext
Loop
Recordset.Close
Connection.Close
set Connection = nothing
Set Recordset = nothing
%>
</table>
</div>
