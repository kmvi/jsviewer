jsviewer
========

JavaScript Viewer for ArcGIS - ��������������� ���-����������, ��������������� ��� ������ � ArcGIS for Server ����� REST-���������. 

��������� ���-����������         
                
	index.html - �������� ���� ���-����������
	proxy.ashx - ������-�������� ���-����������
	proxy.config - ���������������� ���� ������-��������
	config.xml - ���������������� ���� ���-����������
	config_help.txt - ���������� �� ��������� ����������������� ����� config.xml
	readme.txt - ���� ������� 
	main - �����, ���������� �������� ������� ����� ���-����������
	css - ����� � ������� css ��� ��������� ������ ����� � ��������
	images - ����� � �������������, ������� ������������ � ����������
 
��������� ���-����������                       
	��� ��������� ���-���������� ���������� ��������������� ���� config.xml. ���������� �� ��������� ��������� � ����� config_help.txt.

���������������� ����������                        
	����������� ������� ���� (� ��� �����, ���� ArcGIS Online � Google Maps);
	����������� ����� ����� ���-������� ArcGIS for Server;
	��������������� �����;
	�������������� �����;
	������������� �������� �� �����, ����������� ���������� �� ��������, � ��� ����� - �������� � �����������;
	����������� ����������� ����;
	��������� �� �����;
	�������� ����� (��������������);
	���������� ��������� �� �����;
	������� ������ ������� �����;
	������ ����� � �������;
	������ ���������� �������� �� ����;
	������ ��������;
	������ ����������.
	������ ���������� � ���� �������� � ��������� ���� 
	���������� ����� �������� ��� ��� ������� ��������-�����������, ��� � ��� ����. 
	��� ������ � ��������� ���� ����������� �������������� ���������� � ��������� ��������� (��. "������������� ���������� ArcGIS API for JavaScript" � "������������� ��������� ���������").

������ �� ���-�������                     
	� ����� config.xml ����� ��������� ������ ������ �� ���-������� ArcGIS for Server (�������� url). 
	��� ���-��������, ������������������ � ArcGIS Online / Portal for ArcGIS ����� ��������� �������������� ���� �������� � ArcGIS Online / Portal for ArcGIS (�������� portalID). ��� ������������� ����� �������� ����������� ����������� ������ <portal> � config.xml.

������������� ���������� ArcGIS API for JavaScript        
	���-���������� ArcGIS API for JavaScript ��������� �� ���������� ArcGIS API for JavaScript. 
	� ���, ��� ���������� ���������� ArcGIS API for JavaScript, ����� �������� �����.
	��� ������ � ������������� ���� ��� ��������-����������� ���������� ������� ���������� ArcGIS API for JavaScript, ���������� �� � ���� ��������������� ������ �� ����� index.html.
	������������� ArcGIS API for JavaSctipt ���������������� ������������ �����������.

������������� ������� ���� � �������� ArcGIS Online       
	������������� ������� ���� � �������� ArcGIS Online ���������������� ������������ �����������.
	������ ������������� ����������, ���������� ������������� ������� ���� � �������� ArcGIS Online, ��������� ������ �������� �����.

������������� ��������� ���������                     
	���-���������� JavaScript Viewer for ArcGIS ���������� ��������� ���������� agsjs.

	���������� ajsjs ������������ ��� ����������� ������� ������ ����� � ������� (������ <toc> � config.xml) � ��� ����������� ������� ����� Google Maps � ������ ������� ����� Google Maps � ������� ������ ������� ����� (������ <dijit type = "basemaps">),
	��������������� � ���������� ������������ ��������� ������ ����������: 
		agsjs.dijit.TOC ��� ����������� ������� ������ ����� � �������;
		agsjs.layers.GoogleMapsLayer ��� ����������� ����� Google Maps � ������ �� � ������� ������ ������� �����.
	
	������ �� ���������� ����������� � ����� index.html:
	��� ������ � ���� �������� ����������� ������ �� ���������� agsjs  � ����� ������ �� �������� ��������;
	��� ������ � ������������� ���� ��� ������� � �������� ���������� ������� ���������� agsjs � ������� ���������������� ��������� ������ ������ ��������-������. ����� Google Maps ������������ ������ ��� ������� ��������-�����������.

	��� ����������� ���� Google Maps ���������� agsjs ������������ JavaScript API Google ����. ���������� ����������� �� ������������� JavaScript API Google ����.

�������������� �������� 
	�������������� ����� �� �� ��������, ��� � ��������, �������������� ArcGIS API for JavaScript.