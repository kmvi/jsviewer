//dojo
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.store.Memory");
dojo.require("esri.tasks.query");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojo.has");
dojo.require("dijit.CheckedMenuItem");
dojo.require("dijit.MenuSeparator");
dojo.require("dojox.charting.Chart");
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.axis2d.Default");
dojo.require("dojox.charting.plot2d.Lines");
dojo.require("dojox.charting.plot2d.Markers");
dojo.require("dojo.dom-construct");
dojo.require("dojox.charting.widget.Legend");
dojo.require("dijit.form.RadioButton");
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require("dojox.charting.action2d.Magnify");
dojo.require("dojox.charting.action2d.Highlight");
dojo.require("dojox.charting.action2d.MoveSlice");
 
dojo.require("dijit.TooltipDialog");
dojo.require("dojo._base.event");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.layout.ExpandoPane");
dojo.require("dijit.TitlePane");
dojo.require("dojox.charting.themes.Claro");
dojo.require("dojo.dom-construct");
dojo.require("dojo.dom");

// esri 
dojo.require("esri.map");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.tasks.locator");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Measurement");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.TimeSlider");
dojo.require("esri.dijit.editing.Editor-all");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require('esri.dijit.Attribution');
dojo.require("esri.dijit.Print");
dojo.require("esri.geometry");
dojo.require("esri.utils");
dojo.require("esri.renderer");
dojo.require("esri.SnappingManager");
dojo.require("esri.toolbars.edit");
dojo.require("esri.tasks.geometry");
dojo.require("esri.dijit.Geocoder");
dojo.require("esri.widgets");
dojo.require("esri.dijit.Bookmarks");
dojo.require("esri.dijit.Directions");
dojo.require("esri.arcgis.Portal")

//esri-cis
dojo.require("esri-cis.dijit.routing");
dojo.require("esri-cis.dijit.dateFilter");

//google - удалите следующие три строки для отключения модулей Google
dojo.require("dojo.fx");
dojo.require("agsjs.dijit.TOC");
dojo.require("agsjs.layers.GoogleMapsLayer");

//other
dojo.require("app.OAuthHelper");

function startApp() 
{
	loadAppDialog =  new dijit.Dialog ({
		content : "Загрузка приложения ... ",
		closable : false
	});
	
	dojo.style(loadAppDialog.closeButtonNode,"display","none");
	
	identifyDialog =  new dijit.Dialog ({
			content : "Поиск объектов ...",
			closable : false
	});
	
	dojo.style(identifyDialog.closeButtonNode,"display","none");
	
	editDialog =  new dijit.Dialog ({
			content : "Выбор объектов ...",
			closable : false
	});
	
	dojo.style(editDialog.closeButtonNode,"display","none");
	
	loadAppDialog.show();

	try
	{
		LoadConfig();
	}
	catch (err)
	{
		errorDialog = new dijit.Dialog({
			title: "Ошибка",
			content: "Ошибка разбора конфигурационного файла. " + err.message + ' Приложение может работать неправильно.',			
			style: "width: 300px; color: red"
		});
		
		errorDialog.show();
		loadAppDialog.hide();
	};
	
	if (config.portal != undefined)
	{
		try 
		{
			Authorize();
		}
		catch (err)
		{
			errorDialog = new dijit.Dialog({
				title: "Ошибка",
				content: "Ошибка при попытке авторизации на портале ArcGIS. " + err.message + ' Приложение может работать неправильно.',			 
				style: "width: 300px; color: red"
			});
		
			errorDialog.show();
			loadAppDialog.hide();
		};
	}
	
	try 
	{
		Design();
	}
	catch (err)
	{
		errorDialog = new dijit.Dialog({
			title: "Ошибка",
			content: "Ошибка оформления главной страницы приложения." + err.message + ' Приложение может работать неправильно.',			 
			style: "width: 300px; color: red"
		});
		
		errorDialog.show();
		loadAppDialog.hide();
	};
	
	try
	{
		LoadMap();
	}
	catch (err)
	{
		errorDialog = new dijit.Dialog({
			title: "Ошибка",
			content: "Ошибка загрузки карты." + err.message + ' Приложение может работать неправильно.',			 
			style: "width: 300px; color: red"
		});
		
		errorDialog.show();
		loadAppDialog.hide();
	};
}

function LoadConfig()
{
	config  = new Object;
	var xmlhttp = new XMLHttpRequest();
	
	esri.config.defaults.io.corsEnabledServers.push(location.protocol + '//' + location.host);
	esri.config.defaults.io.corsEnabledServers.push("http://services.arcgis.com");
	
	xmlhttp.open("GET","config.xml",false);
	xmlhttp.send();
	var xmlDoc=xmlhttp.responseXML;
	
	try
	{
		var _design = xmlDoc.getElementsByTagName("design");
		var design = new Object;
	
		design.title = ((_design[0] == undefined) || (_design[0].getAttribute ('title') == undefined)) ? 'ArcGIS Viewer for JavaScript 1.0 beta' : _design[0].getAttribute ('title');
		design.theme = ((_design[0] == undefined) || (_design[0].getAttribute ('theme') == undefined)) ? 'gray' : _design[0].getAttribute ('theme');
	
		if (_design[0] != undefined)
		{
			var _heading = _design[0].getElementsByTagName("heading");		
		}
		else
		{
			var _heading = undefined;
		}

		var heading = new Object;
	
		heading.type = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('type') == undefined)) ? 'image' : _heading[0].getAttribute('type');
		heading.image = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('image') == undefined)) ? 'images/header.png' : _heading[0].getAttribute('image');
		heading.fillimage = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('bcakground') == undefined)) ? 'images/background.png' : _heading[0].getAttribute('background');
		heading.height = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('height') == undefined)) ? '63px' : _heading[0].getAttribute('height');
		heading.caption = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('caption') == undefined)) ? 'ArcGIS Viewer for JavaScript 1.0 beta' : _heading[0].getAttribute('caption');
		heading.fontsize = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('font-size') == undefined)) ? '35pt' : _heading[0].getAttribute('font-size');
		heading.fontcolor = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('font-color') == undefined)) ? '#FFFFFF' : _heading[0].getAttribute('font-color');
		heading.bgcolor = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('background-color') == undefined)) ? '#0000FF' : _heading[0].getAttribute('background-color');
		heading.textalign = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('text-align') == undefined)) ? 'left' : _heading[0].getAttribute('text-align');	
	
		design.heading = heading;
		config.design = design;
	}
	catch (err)
	{
		throw new AGSViewerException (101, 'Ошибка в секции [design].');
	}	
	
	try
	{
		var _portal = xmlDoc.getElementsByTagName ("portal");	
	
		if (_portal[0] != undefined)
		{
			var portal            = new Object;
			portal.url            = (_portal[0].getAttribute("url") == undefined) ? 'http://www.arcgis.com' : _portal[0].getAttribute("url");
			portal.appId          = _portal[0].getAttribute("appID");
			portal.expiration     = (_portal[0].getAttribute("expiration") == undefined) ? '60' : _portal[0].getAttribute("expiration");
			portal.showPortalUser = (_portal[0].getAttribute("showPortalUser") == "true");
		
			if (portal.appId == undefined)
			{
				throw new AGSViewerException (1020, "Не задан обязательный параметр appID.");
			}
		
			config.portal = portal;
		};
	}
	catch (err)
	{
		if (err.code == 1020)
		{
			throw new AGSViewerException (102, 'Ошибка в секции [portal].' + ' ' + err.message);
		}
		else
		{
			throw new AGSViewerException (102, 'Ошибка в секции [portal].');
		}
	}
		
	try
	{
		var _proxy = xmlDoc.getElementsByTagName("proxy");
	
		if (_proxy[0] != undefined)
		{
			esri.config.defaults.io.proxyUrl = (_proxy[0].getAttribute("useproxy") == "true");
			esri.config.defaults.io.proxyUrl = (_proxy[0].getAttribute("proxyUrl") == undefined) ? 'proxy.ashx' : _proxy[0].getAttribute("proxyUrl");
		}
	}
	catch (err)
	{
		throw new AGSViewerException (103, 'Ошибка в секции [proxy].');
	}
	
	try
	{
		var _tasks = xmlDoc.getElementsByTagName("tasks");
		var tasks = new Object;
	
		var _geometry = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("geometry") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("geometry");
		tasks.geometry = new Object;
		tasks.geometry.url = ((_geometry == undefined) || (_geometry[0] == undefined) || (_geometry[0].getAttribute("url") == undefined)) ? 'http://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer' : _geometry[0].getAttribute("url");
		esri.config.defaults.geometryService = tasks.geometry.url;
		geometryService = new esri.tasks.GeometryService(esri.config.defaults.geometryService);		

		var _geocoder = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("geocoder") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("geocoder");
		tasks.geocoder = new Object;
		tasks.geocoder.url = ((_geocoder == undefined) || (_geocoder[0] == undefined) || (_geocoder[0].getAttribute("url") == undefined)) ? 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer' : _geocoder[0].getAttribute("url");	
		tasks.geocoder.singleLineFieldName =  ((_geocoder == undefined) || (_geocoder[0] == undefined) || (_geocoder[0].getAttribute("singleLineFieldName") == undefined)) ? 'SingleLine' : _geocoder[0].getAttribute("singleLineFieldName");
	
		var _route = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("route") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("route");
		tasks.route = new Object;
		tasks.route.url = ((_route == undefined) || (_route[0] == undefined) || (_route[0].getAttribute("url") == undefined)) ? 'http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World' : _route[0].getAttribute("url");	
	
		var _print = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("print") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("print");
		tasks.print = new Object;
		tasks.print.url = ((_print == undefined) || (_print[0] == undefined) || (_print[0].getAttribute("url") == undefined)) ? 'http://sampleserver6.arcgisonline.com/arcgis/rest/directories/arcgisoutput/Utilities/PrintingTools_GPServer/Utilities_PrintingTools' : _print[0].getAttribute("url");	
		
		config.tasks = tasks;
	}
	catch (err)
	{
		throw new AGSViewerException (104, 'Ошибка в секции [tasks].');
	}
		
	try
	{
		var _dijits = xmlDoc.getElementsByTagName("dijits");
	
		if (_dijits[0] != undefined)
		{
			var dijits  = new Object;	
			var _dijit  = _dijits[0].getElementsByTagName("dijit");
	
			dojo.forEach(_dijit, function (widget) 
			{
				try
				{
					if (widget.getAttribute("type") == "scalebar")
					{
						dijits.scalebar = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1050, 'Ошибка в секции [scalebar].');
				}

				try
				{
					if (widget.getAttribute("type") == "print")
					{
						dijits.print = new Object;
						dijits.print.title   = (widget.getAttribute("title") == undefined) ? 'ArcGIS Viewer for JavaScript 1.0 beta' : widget.getAttribute("title");
						dijits.print.owner   = (widget.getAttribute("owner") == undefined) ? 'Esri CIS' : widget.getAttribute("owner");
					}
				}
				catch (err)
				{	
					throw new AGSViewerException (1051, 'Ошибка в секции [print.');
				}
				
			
				try
				{
					if (widget.getAttribute("type") == "basemaps")
					{
						dijits.gallery = new Object;
						dijits.gallery.arcgismaps = (widget.getAttribute("arcgismaps") == "true");
						dijits.gallery.googlemaps = (widget.getAttribute("googlemaps") == "true");
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1052, 'Ошибка в секции [basemaps].');
				}
			
				try
				{
					if (widget.getAttribute("type") == "measure")
					{
						dijits.measure = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1053, 'Ошибка в секции [measure].');
				}
				
				try
				{
					if (widget.getAttribute("type") == "overview")
					{
						dijits.overviewmap = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1054, 'Ошибка в секции [overview].');
				}
				
				try
				{		
					if (widget.getAttribute("type") == "geocoder")
					{
						dijits.geocoder = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1055, 'Ошибка в секции [geocoder].');
				}
				
				try
				{
					if (widget.getAttribute("type") == "editor")
					{
						dijits.editor = new Object;
						dijits.editor.toolbar = (widget.getAttribute("toolbar") == undefined) ? true : (widget.getAttribute("toolbar") == "true");
			
						if (dijits.editor.toolbar)
						{
							var tools = widget.getElementsByTagName ("tools");
							dijits.editor.tools = new Object;
							dijits.editor.tools.undoRedoTool = ((tools[0] == undefined) || (tools[0].getAttribute("undo-redoTool") == undefined)) ? true : (tools[0].getAttribute("undo-redoTool") == "true");
								
							try
							{
								dijits.editor.tools.undoRedoMaxOperations = ((tools[0] == undefined) || (tools[0].getAttribute("undo-redoMaxOperations") == undefined)) ? 10 : parseInt (tools[0].getAttribute("undo-redoMaxOperations"))
							}
							catch (err)
							{
								throw new AGSViewerException (10560, 'Ошибка в параметре undo-redoMaxOperations.');
							}								
								
							dijits.editor.tools.mergeTool   = ((tools[0] == undefined) || (tools[0].getAttribute("mergeTool") == undefined)) ? true : (tools[0].getAttribute("mergeTool") == "true");
							dijits.editor.tools.cutTool     = ((tools[0] == undefined) || (tools[0].getAttribute("cutTool") == undefined)) ? true : (tools[0].getAttribute("cutTool") == "true");
							dijits.editor.tools.reshapeTool = ((tools[0] == undefined) || (tools[0].getAttribute("reshapeTool") == undefined)) ? true : (tools[0].getAttribute("reshapeTool") == "true");
							
							dijits.editor.tools.polygonDrawTools  = ((tools[0] == undefined) || (tools[0].getAttribute("polygonDrawTools") == undefined)) ? "POLYGON,FREEHAND_POLYGON,AUTOCOMPLETE,RECTANGLE,CIRCLE,TRIANGLE,ELLIPSE" : tools[0].getAttribute("polygonDrawTools");
							dijits.editor.tools.polygonDrawTools = dijits.editor.tools.polygonDrawTools.split (',');				

							dijits.editor.tools.polylineDrawTools  = ((tools[0] == undefined) || (tools[0].getAttribute("polylineDrawTools") == undefined)) ? "POLYLINE,FREEHAND_POLYLINE,AUTOCOMPLETE,RECTANGLE,CIRCLE,TRIANGLE,ELLIPSE" : tools[0].getAttribute("polylineDrawTools");
							dijits.editor.tools.polylineDrawTools = dijits.editor.tools.polylineDrawTools.split (',');				
						}	
					}	
				}
				catch (err)
				{
					if (error.code == 10560)
					{					
						throw new AGSViewerException (1056, 'Ошибка в секции [editor].' + ' ' + err.message);
					}
					else
					{
						throw new AGSViewerException (1056, 'Ошибка в секции [editor].');
					}
				}
		
				try
				{
					if (widget.getAttribute("type") == "bookmarks")
					{
						dijits.bookmarks = new Object;
						dijits.bookmarks.bookmarks = [];
						dijits.bookmarks.editable = (widget.getAttribute("editable") == undefined) ? true : widget.getAttribute("editable");
					
						var _bookmarks = widget.getElementsByTagName("bookmarks");
					
						if (_bookmarks[0] != undefined)
						{
							var _bookmark  = _bookmarks[0].getElementsByTagName("bookmark");
							var item;
					
							if (_bookmark != undefined)
							{
								dojo.forEach(_bookmark, function (item) 
								{
									var bookmark = new Object;
																		
									bookmark.title = item.getAttribute("title");
									
									if (bookmark.title == undefined)
									{
										throw new AGSViewerException (10570, 'Ошибка в элементе <bookmark>: не указан параметр title.');
									}
							
									var _extent = item.getElementsByTagName("extent");
							
									if (_extent[0] != undefined)
									{
										bookmark.extent = new Object;
										
										bookmark.extent.xmin = _extent[0].getAttribute("xmin");
										bookmark.extent.xmax = _extent[0].getAttribute("xmax");
										bookmark.extent.ymin = _extent[0].getAttribute("ymin");
										bookmark.extent.ymax = _extent[0].getAttribute("ymax");
										
										if (bookmark.extent.xmin == undefined)
										{
											throw new AGSViewerException (105710, 'Ошибка в элементе <bookmark>: не указан параметр xmin.');
										}
										
										if (bookmark.extent.xmax == undefined)
										{
											throw new AGSViewerException (105711, 'Ошибка в элементе <bookmark>: не указан параметр xmax.');
										}
										
										if (bookmark.extent.ymin == undefined)
										{
											throw new AGSViewerException (105712, 'Ошибка в элементе <bookmark>: не указан параметр ymin.');
										}
										
										if (bookmark.extent.ymax == undefined)
										{
											throw new AGSViewerException (105713, 'Ошибка в элементе <bookmark>: не указан параметр ymax.');
										}									
								
										dijits.bookmarks.bookmarks.push (bookmark);						
									}
									else
									{
										throw new AGSViewerException (10571, 'Ошибка в элементе <bookmark>: не указан параметр extent.');
									}
								});
							}
						};
					};
				}
				catch (err)
				{
					if ((err.code == 10570) || (err.code == 10571) || (err.code == 105710) || (err.code == 105711) || (err.code == 105712) || (err.code == 105713))
					{
						throw new AGSViewerException (1057, 'Ошибка в секции [bookmarks].' + ' ' + err.message);
					}
					else
					{
						throw new AGSViewerException (1057, 'Ошибка в секции [bookmarks].');
					}
				}
			
				try
				{
					if (widget.getAttribute("type") == "legend")
					{
						dijits.legend = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1058, 'Ошибка в секции [legend].');
				}
				
				try
				{
					if (widget.getAttribute("type") == "toc")
					{
						dijits.toc = new Object;
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1059, 'Ошибка в секции [toc].');
				}
			
				try
				{
					if (widget.getAttribute("type") == "info")
					{
						dijits.details = new Object;
						dijits.details.html = widget.getAttribute("html");
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1060, 'Ошибка в секции [info].');
				}
			
				try
				{
					if (widget.getAttribute("type") == "identify")
					{
						dijits.identify = new Object;
						dijits.identify.tolerance = widget.getAttribute("tolerance");
						
						try
						{
							dijits.identify.tolerance = parseInt (dijits.identify.tolerance);							
						}
						catch (err)
						{
							dijits.identify.tolerance = 10;
						}
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1061, 'Ошибка в секции [identify].');
				}
			
				try
				{
					if (widget.getAttribute("type") == "route")
					{
						dijits.route = new Object;
						dijits.route.routeSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([50, 0, 255]), 3);
					}
				}
				catch (err)
				{
					throw new AGSViewerException (1062, 'Ошибка в секции [route].');
				}
			
				
				try
				{
					if (widget.getAttribute("type") == "dateFilter")
					{
						dijits.dateFilter = new Object;
						dijits.dateFilter.limits = (widget.getAttribute("limits") == undefined) ? 'single' : widget.getAttribute("limits");
						dijits.dateFilter.field = widget.getAttribute("field");
						
						if (dijits.dateFilter.field == undefined)
						{
							throw new AGSViewerException (10631, 'Не задан параметр field.');
						}
					}
				}
				catch (err)
				{	
					if (err.code == 10631)
					{
						throw new AGSViewerException (1063, 'Ошибка в секции [dateFielter].' + ' ' + err.message);
					}
					else
					{
						throw AGSViewerException (1063, 'Ошибка в секции [dateFielter].' + ' ' + err.message);
					}
				}
			});
		}
		else
		{
			var dijits = undefined;
		}
	
		config.widgets = dijits;
	}
	catch (err)
	{
		throw new AGSViewerException (105, 'Ошибка в секции [dijits].' + ' ' + err.message);
	}
	
	// карта
	var map = new Object;
	_map = xmlDoc.getElementsByTagName("map");
	_options = _map[0].getElementsByTagName ("options");
	
	// общие свойста карты
	var options = new Object;
	options.wkid = _options[0].getAttribute("wkid");
	options.slider = _options[0].getAttribute("slider");
	options.basemap = _options[0].getAttribute("basemap");
	options.wrapAround180 = (_options[0].getAttribute("wrapAround180") == "true");
	options.logoVisible = (_options[0].getAttribute("logoVisible") == "true");
	options.attributionVisible = (_options[0].getAttribute("attributionVisible") == "true");
	
	var _extent = _options[0].getElementsByTagName ("extent");
	
	if (_extent[0] != undefined)
	{
		var extent = new Object;
		extent.xmin = _extent[0].getAttribute("xmin");
		extent.xmax = _extent[0].getAttribute("xmax");
		extent.ymin = _extent[0].getAttribute("ymin");
		extent.ymax = _extent[0].getAttribute("ymax");
		options.extent = extent;	
	}

	map.options = options;	
	
	// базовые карты
	_basemaps = _map[0].getElementsByTagName("basemaps");
	_basemap  = _basemaps[0].getElementsByTagName("basemap");
	
	map.basemaps = [];
		
	dojo.forEach(_basemap, function (item) 
	{
		var basemap = new Object;
		basemap.id   		= item.getAttribute("id");
		basemap.title		= item.getAttribute("title");
		basemap.visible 	= (item.getAttribute("visible") == "true");
		basemap.gallery 	= item.getAttribute("basemapgallery");
		basemap.galleryimg = item.getAttribute("basemapgalleryimg");
		basemap.layers     = [];
		
		_layers = item.getElementsByTagName("layers");
		_layer  = _layers[0].getElementsByTagName("layer");
		
		dojo.forEach(_layer, function (item1) 
		{
			var layer   = new Object;
			layer.type    = item1.getAttribute("type");
			layer.url     = item1.getAttribute("url");
			layer.portalId = item1.getAttribute("portalId"); 
			layer.token   = item1.getAttribute("token");
			layer.opacity = item1.getAttribute("opacity");
			layer.id      = item1.getAttribute("id");
			layer.title   = item1.getAttribute("title");
			layer.toc     = (item1.getAttribute("toc") == "true");
			layer.tocSlider  = (item1.getAttribute("tocSlider") == "true");
			layer.tocLegend  = (item1.getAttribute("tocLegend") == "true");
			layer.legend     = (item1.getAttribute("lehend") == "true");
			layer.list       = (item1.getAttribute("list") == "true");
			basemap.layers.push (layer);
		});

		
		map.basemaps.push (basemap);
	})
	
	
	// операционные слои
	var _opLayers = _map[0].getElementsByTagName("mapLayers");
	var _layer    = _opLayers[0].getElementsByTagName("layer");
	
	var edit  = new Object;
	var popup = new Object;
	
	map.layers = [];
	map.identifyLayers = [];
	
	dojo.forEach(_layer, function (item) 
	{
		var layer = new Object;
		layer.type     = item.getAttribute("type");
		layer.id       = item.getAttribute("id");
		layer.url      = item.getAttribute("url");
		layer.portalId = item.getAttribute("portalId"); 
		layer.legend   = (item.getAttribute("legend") == "true");
		layer.toc      = (item.getAttribute("toc") == "true");
		layer.tocSlider  = (item.getAttribute("tocSlider") == "true");
		layer.tocLegend  = (item.getAttribute("tocLegend") == "true");
		layer.dateFilter = (item.getAttribute("dateFilter") == "true");
		layer.visible  = item.getAttribute("visible");
		layer.list     = (item.getAttribute("list") == "true");
		layer.title    = item.getAttribute("title");
		layer.token    = item.getAttribute("token");	
		
		if (layer.type == "dynamic")
		{
			var sublayers = [];
			var flIdentify = false;
			
		
			_sublayers = item.getElementsByTagName ("sublayers");
			
			if (_sublayers[0] != undefined)
			{
				var _sublayer = _sublayers[0].getElementsByTagName ("sublayer");
				
					
				dojo.forEach (_sublayer, function (item1)
				{
					var sublayer = new Object;
					sublayer.id = item1.getAttribute("id");
					sublayer.definitionExpression = item1.getAttribute("definitionExpression");
					sublayer.definitionExpressionSkipLogins = item1.getAttribute("definitionExpressionSkipLogins");
					sublayer.visible = (item1.getAttribute("visible") == true);
			
					var _popup         = item1.getElementsByTagName("popup");
			
					if (_popup[0] != undefined)
					{
						flIdentify = true;
					
						var popup = new Object;		
						
						popup.title     = _popup[0].getAttribute("title");
						popup.description  = _popup[0].getAttribute("description");
									
						var _content           = _popup[0].getElementsByTagName("fieldInfos");
						var _item2              = _content[0].getElementsByTagName("fieldInfo");					
					
						var fieldInfos = [];
			
						dojo.forEach(_item2, function(item2)
						{
							var fieldInfo = new Object;
							fieldInfo.fieldName = item2.getAttribute("field");
							fieldInfo.label = item2.getAttribute("label");
							fieldInfo.format = item2.getAttribute("dateFormat");
							
							if (fieldInfo.format != undefined)
							{
								fieldInfo.format = {dateFormat : fieldInfo.format};
							}
							else
							{
							
							fieldInfo.format = item2.getAttribute("numericFormat");
							
							if (fieldInfo.format != undefined)
							{
								fieldInfo.format = fieldInfo.format.split(',');
								fieldInfo.format = {places : parseInt (fieldInfo.format[0]), digitalSeparator : fieldInfo.format[1] == "true"};
							};};
							
							fieldInfo.visible = (item2.getAttribute("visible") == "true");
						
							fieldInfos.push (fieldInfo);
						})	

						popup.fieldInfos = fieldInfos;
						
						var _mediaInfos           = _popup[0].getElementsByTagName("mediaInfos");		

						if (_mediaInfos[0] != undefined)
						{
							var _item3             = _mediaInfos[0].getElementsByTagName("mediaInfo");
				
							popup.mediaInfos = new Object;
				
							var mediaInfos = [];
				
							dojo.forEach(_item3, function(item2)
							{
								var mediaInfo = new Object;
								mediaInfo.title = item2.getAttribute("title");
								mediaInfo.caption = item2.getAttribute("caption");
								mediaInfo.shortCaption = item2.getAttribute("shortCaption");
								mediaInfo.type = item2.getAttribute("type");
								mediaInfo.legend = (item2.getAttribute("legend") == "true");
								mediaInfo.subtype = item2.getAttribute("subtype");
								mediaInfo.value = new Object;
					
								if (mediaInfo.type == "image")
								{
									mediaInfo.value.sourceUrl = item2.getAttribute("sourceUrl");
									mediaInfo.value.linkUrl = item2.getAttribute("linkUrl");
								}
								else
								{
									mediaInfo.value.fields  = item2.getAttribute("fields").split(",");
									
									if (item2.getAttribute("labels") != undefined) 
									{
										mediaInfo.xlabels = item2.getAttribute("labels").split(",");
									}									
								}
	
								mediaInfos.push (mediaInfo);
							})	
				
							popup.mediaInfos.list = mediaInfos;
						}
						else
						{
							popup.mediaInfos = null;
						}	
			
						sublayer.popup = popup;
					}
					else
					{
						sublayer.popup = null;
					}
					
					var _edit = item1.getElementsByTagName("edit");
			
					if (_edit[0] != undefined)
					{
						var edit = new Object;
						
						edit.featureServiceUrl = _edit[0].getAttribute ("featureServiceUrl");
						var _fields = _edit[0].getElementsByTagName ("fields");
						var _field = _fields[0].getElementsByTagName ("field");
				
						var fieldInfos = [];
				
						dojo.forEach(_field, function(item2)
						{
							var fieldInfo = new Object;
							fieldInfo.fieldName = item2.getAttribute("name");
							fieldInfo.label = item2.getAttribute("label");
							fieldInfos.push (fieldInfo);
						})	
				
						edit.fieldInfos = fieldInfos;
						sublayer.edit = edit;						
					}
					else
					{	
						sublayer.edit = null;
					}
			
					sublayers.push (sublayer);
				});
				
				if (flIdentify)
				{
					map.identifyLayers.push (layer);
				}
			
				layer.sublayers = sublayers;
			}
			else
			{
				layer.sublayers = null
			}
		}
		else
		{
			layer.sublayers = null;
		}
				
		if (layer.type == "feature")
		{
			layer.mode = item.getAttribute("mode");	
			layer.time = (item.getAttribute("time") == "true");
			layer.expandTimeInfo = (item.getAttribute("expandTimeInfo") == "true");
			layer.outFields = item.getAttribute("outFields").split(",");
			layer.minScale = item.getAttribute("minScale");	
			layer.maxScale = item.getAttribute("maxScale");	
			layer.title = item.getAttribute("title");	
			layer.title = item.getAttribute("title");	
			layer.snapping = (item.getAttribute ("snapping") == "true");
						
			layer.definitionExpression = item.getAttribute("definitionExpression");
			layer.event = item.getAttribute("event");
			
			var _tooltip = item.getElementsByTagName ("tooltip");
			
			if (_tooltip[0] != undefined)
			{
				var tooltip = new Object;		
				tooltip.title   = _tooltip[0].getAttribute("title");
				tooltip.content = _tooltip[0].getAttribute("content");
				tooltip.opacity = _tooltip[0].getAttribute("opacity");
				layer.tooltip   = tooltip;
			}
			else
			{
				layer.tooltip = null;
			}
			
			var _popup = item.getElementsByTagName("popup");
			
			if (_popup[0] != undefined)
			{
				var popup = new Object;		
				popup.title        = _popup[0].getAttribute("title");
				popup.description  = _popup[0].getAttribute("description");
				popup.showAttachments = (_popup[0].getAttribute("showAttachments") == "true");
				popup.process   = _popup[0].getAttribute("process");
				
				popup.fieldInfos = null;
				popup.mediaInfos = null;
				
				var _fieldInfos  = _popup[0].getElementsByTagName("fieldInfos");

				if (_fieldInfos[0] != undefined)
				{
					var _item = _fieldInfos[0].getElementsByTagName("fieldInfo");					
					
					var fieldInfos = [];
			
					dojo.forEach(_item, function(item2)
					{
						var fieldInfo = new Object;
						fieldInfo.fieldName = item2.getAttribute("field");
						fieldInfo.label = item2.getAttribute("label");
						fieldInfo.format = item2.getAttribute("dateFormat");
						
						if (fieldInfo.format != undefined)
						{
							fieldInfo.format = {dateFormat : fieldInfo.format};
						}
						else
						{
							fieldInfo.format = item2.getAttribute("numericFormat");
					
							if (fieldInfo.format != undefined)
							{
								fieldInfo.format = fieldInfo.format.split(',');
								fieldInfo.format = {places : parseInt (fieldInfo.format[0]), digitalSeparator : fieldInfo.format[1] == "true"};
							};
						};
							
						fieldInfo.visible = "true";
						fieldInfos.push (fieldInfo);
					})	
				
					popup.fieldInfos = fieldInfos;
				}
				else
				{
					popup.fieldInfos = [];
				}
				
				var _mediaInfos           = _popup[0].getElementsByTagName("mediaInfos");		

				if (_mediaInfos[0] != undefined)
				{
					var _item              = _mediaInfos[0].getElementsByTagName("mediaInfo");
					popup.mediaInfos = new Object;
					popup.mediaInfos.idField = _mediaInfos[0].getAttribute("idField");
					popup.mediaInfos.dateField = _mediaInfos[0].getAttribute("dateField");
					popup.mediaInfos.count = parseInt(_mediaInfos[0].getAttribute("count"));
					popup.mediaInfos.format = _mediaInfos[0].getAttribute("format");
					popup.mediaInfos.title = _mediaInfos[0].getAttribute("title");
					popup.mediaInfos.points = 0;
					popup.mediaInfos.intervals = 0;
				
					var mediaInfos = [];
			
					dojo.forEach(_item, function(item2)
					{
						var mediaInfo = new Object;
						mediaInfo.title = item2.getAttribute("title");
						mediaInfo.caption = item2.getAttribute("caption");
						mediaInfo.shortCaption = item2.getAttribute("shortCaption");
						mediaInfo.type = item2.getAttribute("type");
						mediaInfo.legend = (item2.getAttribute("legend") == "true");
						mediaInfo.subtype = item2.getAttribute("subtype");
						mediaInfo.selection = item2.getAttribute("selection");
						mediaInfo.compare = (item2.getAttribute("compare") == "true")
												
						if (mediaInfo.selection == "point")
						{
							popup.mediaInfos.points = popup.mediaInfos.points + 1;
							
							mediaInfo.value = new Object;
				
							if (mediaInfo.type == "image")
							{
								mediaInfo.value.sourceUrl = item2.getAttribute("sourceUrl");
								mediaInfo.value.linkUrl = item2.getAttribute("linkUrl");
							}
							else
							{
								mediaInfo.value.fields = item2.getAttribute("y-fields").split(",");
					
								if (item2.getAttribute("x-labels") != undefined) 
								{
									mediaInfo.xlabels = item2.getAttribute("x-labels").split(",");
								}	
							}
						}
						else if (mediaInfo.selection == "interval")
						{
							popup.mediaInfos.intervals = popup.mediaInfos.intervals + 1;
														
							mediaInfo.yfield   = item2.getAttribute("y-field");
							mediaInfo.dateField = item2.getAttribute("dateField");
							mediaInfo.dateFieldFormat = item2.getAttribute("dateFieldFormat");
							mediaInfo.idField = item2.getAttribute("idField");
							mediaInfo.rowCount = item2.getAttribute("rowCount");
						}
						
						mediaInfos.push (mediaInfo);
					})	
			
					popup.mediaInfos.list = mediaInfos;
				}
				else
				{
					popup.mediaInfos = null;
				}

				layer.popup = popup;
			}
			else
			{
				layer.popup = null;
			}
			
			var _edit = item.getElementsByTagName("edit");
			
			if (_edit[0] != undefined)
			{
				var edit = new Object;
				var _fields = _edit[0].getElementsByTagName ("fields");
				var _field = _fields[0].getElementsByTagName ("field");
				
				var fieldInfos = [];
				
				dojo.forEach(_field, function(item2)
				{
					var fieldInfo = new Object;
					fieldInfo.fieldName = item2.getAttribute("name");
					fieldInfo.label = item2.getAttribute("label");
					fieldInfos.push (fieldInfo);
				})	
				
				edit.fieldInfos = fieldInfos;
				layer.edit = edit;
			}
			else
			{
				layer.edit = null;
			}
			
			var _featureLabels = item.getElementsByTagName ("featureLabels");
			
			if ((_featureLabels[0] != undefined) && (layer.mode == "SNAPSHOT"))
			{
				var featureLabels = new Object;
				featureLabels.field = _featureLabels[0].getAttribute("field");
				featureLabels.offsetX = parseInt (_featureLabels[0].getAttribute("offsetX"));
				featureLabels.offsetY = parseInt (_featureLabels[0].getAttribute("offsetY"));
				
				featureLabels.minScale = _featureLabels[0].getAttribute("minScale");
				featureLabels.maxScale = _featureLabels[0].getAttribute("maxScale");
				
				var _font = _featureLabels[0].getElementsByTagName ("font");
				
				if (_font[0] != undefined)
				{
					featureLabels.font = new Object;
					featureLabels.font.name = _font[0].getAttribute("name");
					featureLabels.font.color = _font[0].getAttribute("color"); 
					featureLabels.font.size = _font[0].getAttribute("size");
					featureLabels.font.bold = (_font[0].getAttribute("bold") == "true");
					featureLabels.font.italic = (_font[0].getAttribute("italic") == "true");
				}
				else
				{
					featureLabels.font = null;
				}
				
				layer.featureLabels = featureLabels;
			}
			else
			{
				layer.featureLabels = null;
			}
				
		}
		
		map.layers.push (layer);
	})
		
	config.map = map;
	
	return true;
}

function Authorize ()
{
	OAuthHelper.init({
		appId:      config.portal.appId,
		portal:     config.portal.url,
		expiration: parseInt (config.portal.expiration),
		popup:      false
	});   

	if (OAuthHelper.isSignedIn()) 
	{
		SignInPortal ();
	}
	else 
	{
		OAuthHelper.signIn().then(SignInPortal);
	}
}

function SignInPortal ()
{
	require(["esri/arcgis/Portal"], function(esriPortal) { 
		new esriPortal.Portal("https://www.arcgis.com").signIn().then(
			function(portalUser)
			{
				config.portal.user = portalUser.fullName;
				config.portal.portal = portalUser.portal;
				GetServiceUrls ();				
			}
        ).otherwise(
			function(error) 
			{
				throw new AGSViewerException (601, 'Ошибка при подключении к порталу.');
			}
        );
	});
}

function GetServiceUrls ()
{
	var q = '';
	
	for (var i = 0, counti = config.map.layers.length; i < counti; i++)
	{		
		if (((config.map.layers[i].url == null) || (config.map.layers[i].url == '')) && (config.map.layers[i].portalId != null) && (config.map.layers[i].portalId != ''))
		{
			if (i > 0)
			{
				q = q + ' OR ';
			}
			
			q = q + 'id:' + config.map.layers[i].portalId;
		}
	}
	
	var queryParams = 
	{
		q: q
	};
	
	config.portal.portal.queryItems(queryParams).then(GetItemUrls);
}

function GetItemUrls (items)
{
	for (var i = 0; i < items.results.length; i ++)
	{
		for (var j = 0; j < config.map.layers.length; j++)
		{
			if (config.map.layers[j].portalId == items.results[i].id)
			{
				config.map.layers[j].url = items.results[i].url;
				break;
			}
		}
	}
	
	createApp();
}

function Design()
{
	document.title = config.design.title;
	
	var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = "css/" + config.design.theme + ".css";
    document.getElementsByTagName("head")[0].appendChild(ss);	
	
	dojo.style(dojo.byId("heading"), "height", config.design.heading.height);
	dojo.style(dojo.byId("header"),  "height", config.design.heading.height);
	
	if (config.design.heading.type == "caption")
	{
		dojo.byId("heading").innerHTML = config.design.heading.caption;
		dojo.style(dojo.byId("heading"), "font-size", config.design.heading.fontsize);
		dojo.style(dojo.byId("heading"), "color", config.design.heading.fontcolor);
		dojo.style(dojo.byId("heading"), "background-color", config.design.heading.bgcolor);
		dojo.style(dojo.byId("heading"), "text-align", config.design.heading.textalign);
	}
	else if (config.design.heading.type == "image")
		{
			dojo.style(dojo.byId("heading"), "background-image", "url(" + config.design.heading.fillimage + ")");
			dojo.style(dojo.byId("heading"), "background-position", "left top");
			dojo.style(dojo.byId("heading"), "background-repeat", "repeat-x");
		
			var img = document.createElement("img");
			img.setAttribute ("src", config.design.heading.image);
			dojo.style (img, "display", "block");
			dojo.style (img, "left", "0px");
			document.getElementById("heading").appendChild(img);
		};
}

function LoadMap() 
{	
	if (config.map.options.extent != undefined)
	{
		var extent = new esri.geometry.Extent (parseInt (config.map.options.extent.xmin), parseInt (config.map.options.extent.ymin), parseInt (config.map.options.extent.xmax), parseInt (config.map.options.extent.ymax), new esri.SpatialReference({ wkid: parseInt(config.map.options.wkid) }));
	}
	else
	{
		var extent = null;
	};
		
	var slider = config.map.options.slider != "none";

	var popup = new esri.dijit.Popup({
		fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]))
	}, dojo.create("div"));
	
	var arcgisBaseMaps = ["streets" , "satellite" , "hybrid", "topo", "gray", "oceans", "national-geographic", "osm"];
	
	if (arcgisBaseMaps.indexOf (config.map.options.basemap) >= 0)
	{
		map = new esri.Map("map",{extent: extent, slider: slider, sliderStyle:  config.map.options.slider, basemap : config.map.options.basemap, infoWindow: popup, logo : config.map.options.logoVisible, showAttribution: config.map.options.attributionVisible, wrapAround180 : config.map.options.wrapAround180, fadeOnZoom: true, showInfoWindowOnClick : false})
		map['noBasemap'] = false;
	}
	else
	{
		map = new esri.Map("map",{extent: extent, slider: slider, sliderStyle:  config.map.options.slider, infoWindow: popup,  wrapAround180 : config.map.options.wrapAround180, logo : config.map.options.logoVisible, showAttribution: config.map.options.attributionVisible, fadeOnZoom: true, showInfoWindowOnClick : false})
		map['noBasemap'] = true;
	}
	
	map.on ('layers-add-result', LayersAddedToMap);
	map.on ('click', OnMapClick);
	map.on ('load', OnMapLoad);
		
	var url, layer, mode;
	var layers = [];
	map.editableLayerCount = 0;
		
	for (var i = 0, counti = config.map.layers.length; i < counti; i++)
	{
		if ((config.map.layers[i].url != null) && (config.map.layers[i].url != ''))
		{
			if ((config.map.layers[i].token != "") && (config.map.layers[i].token != undefined))
			{
				url = config.map.layers[i].url + "?token=" + config.map.layers[i].token
			}
			else
			{
				url = config.map.layers[i].url
			}
		}

		if (config.map.layers[i].type == "tiled")
		{
			var layer = new esri.layers.ArcGISTiledMapServiceLayer (url, {id : config.map.layers[i].id, visible : config.map.layers[i].visible, opacity : config.map.layers[i].opacity});				
		}
				
		if (config.map.layers[i].type == "dynamic")
		{
			var layer = new esri.layers.ArcGISDynamicMapServiceLayer(url,{id : config.map.layers[i].id, visible: config.map.layers[i].visible, opacity : config.map.layers[i].opacity });
			layer['featureSubLayers'] = [];
						
			if (config.map.layers[i].sublayers != null)
			{
				var definitionExpressions = [];
				
				for (var j = 0, countj = config.map.layers[i].sublayers.length; j < countj; j++)
				{	
					definitionExpressions[config.map.layers[i].sublayers[j].id] = config.map.layers[i].sublayers[j].definitionExpression;
					
					if ((config.map.layers[i].sublayers[j].definitionExpression != undefined) && (config.map.layers[i].sublayers[j].definitionExpression.indexOf("$login") >= 0))
					{
						definitionExpressions[config.map.layers[i].sublayers[j].id] = definitionExpressions[config.map.layers[i].sublayers[j].id];
						
						if ((config.map.layers[i].sublayers[j].definitionExpressionSkipLogins != undefined) && (config.map.layers[i].sublayers[j].definitionExpressionSkipLogins != ''))
						{
							definitionExpressions[config.map.layers[i].sublayers[j].id] =  definitionExpressions[config.map.layers[i].sublayers[j].id] + "$skipLogins=" + config.map.layers[i].sublayers[j].definitionExpressionSkipLogins;
						}
						
					}
										
					if (config.map.layers[i].sublayers[j].edit != null)
					{
						try
						{
							featureSubLayer = new esri.layers.FeatureLayer(config.map.layers[i].sublayers[j].edit.featureServiceUrl,{
								mode: esri.layers.FeatureLayer.MODE_SELECTION,
								outFields: ["*"]
							});
							
							map.editableLayerCount = map.editableLayerCount + 1;
						}
						catch (err)
						{
						}
						
						dojo.connect (featureSubLayer, "onSelectionComplete", function (features,selectionMethod)
						{
							if (features.length > 0)						
							{
								map.selectedLayers.push (features[0].getLayer());
							}		

							map.selectableLayerCount = map.selectableLayerCount + 1;
							
							if (map.selectableLayerCount == map.editableLayerCount)
							{
								editDialog.hide();
							}
						
						})		
						
						featureSubLayer['edit'] = true;
						featureSubLayer['editFieldInfos'] = config.map.layers[i].sublayers[j].edit.fieldInfos;
						
						layers.push (featureSubLayer);
						layer.featureSubLayers.push (featureSubLayer);
						//layer.setDisableClientCaching(true);
					}
				}
				
				layer.setLayerDefinitions (definitionExpressions);
			}			
		}
		
		if (config.map.layers[i].type == "feature")
		{
			var mode;
			
			if (config.map.layers[i].mode == "SNAPSHOT")
			{
				mode = esri.layers.FeatureLayer.MODE_SNAPSHOT;
			}
			
			if ((config.map.layers[i].mode == "ONDEMAND") || config.map.layers[i].mode == "")
			{
				mode = esri.layers.FeatureLayer.MODE_ONDEMAND;
			}
			
			if (config.map.layers[i].mode == "SELECTION")
			{
				mode = esri.layers.FeatureLayer.MODE_SELECTION;
			}		
			
			var layer = new esri.layers.FeatureLayer(url,{id : config.map.layers[i].id, visible: config.map.layers[i].visible, outFields: config.map.layers[i].outFields, mode: mode});	
			
			if (config.map.layers[i].popup != null) 
			{
				dojo.connect(layer, "onClick", function (evt)
				{
					if (activeTool == 'identify')
					{
						ShowFeatureLayerInfoWindow (evt);
					}
				})					
			};
			
			if (config.map.layers[i].tooltip != null)
			{
				dojo.connect(layer, "onMouseOver", function (evt)							
				{
					if (activeTool == 'identify')
					{
						layer = evt.graphic.getLayer();
						
						for (i = 0; i < config.map.layers.length; i ++)
						{
							if (config.map.layers[i].id == layer.id)
							{
								title = "";
															
								if ((config.map.layers[i].tooltip.title != "") && (config.map.layers[i].tooltip.title != undefined))
								{
									title = "<b>" + config.map.layers[i].tooltip.title + "</b></br>";
								}
								
								var content = esri.substitute(evt.graphic.attributes, title + config.map.layers[i].tooltip.content);								
								tooltipDialog.setContent(content);
								
								if (config.map.layers[i].tooltip.opacity != undefined)
								{
									dojo.style(tooltipDialog.domNode, "opacity", config.map.layers[i].tooltip.opacity);
								}
								
								dijit.popup.open({popup: tooltipDialog, x:evt.pageX,y:evt.pageY});
								break;
							}
						}
					}
				})
					
				dojo.connect(layer, "onMouseOut", function (evt)
				{
					if (activeTool == 'identify')
					{
						dijit.popup.close(tooltipDialog);
					}
				})
			}
			
			if (config.map.layers[i].edit != null)
			{
				layer ['edit'] = true;
				layer ['editFieldInfos'] = config.map.layers[i].edit.fieldInfos;
			}
			
			if (config.map.layers[i].featureLabels != null) 
			{
				var graphicsLayer = new esri.layers.GraphicsLayer({id: layer.id + "_labels"});
				layers.push (graphicsLayer);
				dojo.connect (layer, "onUpdateEnd", afterLayerUpdate);
			}
			
			layer.setDefinitionExpression (config.map.layers[i].definitionExpression);
			
			layer ['snapping']   = config.map.layers[i].snapping;
		}

		layer ['title']      = config.map.layers[i].title;
		layer ['toc']        = config.map.layers[i].toc;
		layer ['tocSlider']  = config.map.layers[i].tocSlider;
		layer ['tocLegend']  = config.map.layers[i].tocLegend;
		layer ['legend']     = config.map.layers[i].legend;
		layer ['list']       = config.map.layers[i].list;
		layer ['dateFilter'] = config.map.layers[i].dateFilter;	

		layers.push (layer);		
	}
	
	map.addLayers(layers);
			
	tooltipDialog = new dijit.TooltipDialog({
          id: "tooltipDialog",
          style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
    });
		
    tooltipDialog.startup();
	
	BindMapInfoWindowEvents();
}

function BindMapInfoWindowEvents()
{
	dojo.connect(map.infoWindow, "onShow", function(){
		if (activeTool == 'edit')
		{
			editDialog.hide();
		}		
    });
	
	dojo.connect(map.infoWindow, "onSelectionChange", function(){
		if (activeTool == 'identify')
		{
			if (map.infoWindow.features != null)
			{
				if (map.infoWindow.getSelectedFeature() == map.infoWindow.features[0])
				{
					dijit.byId("identifyPanelButtonPrevious").setAttribute ("disabled", true);	
				}
				else
				{
					dijit.byId("identifyPanelButtonPrevious").setAttribute ("disabled", false);
				}
		
				if (map.infoWindow.getSelectedFeature() == map.infoWindow.features[map.infoWindow.features.length - 1])
				{
					dijit.byId("identifyPanelButtonNext").setAttribute ("disabled", true);
				}
				else
				{
					dijit.byId("identifyPanelButtonNext").setAttribute ("disabled", false);
				}
			}
		
		
			displayPopupContent(map.infoWindow.getSelectedFeature());
		}
    });
				
	dojo.connect(map.infoWindow, "onClearFeatures", function(){
		if (activeTool == 'identify')
		{
			dojo.byId("identifyPanelFeatureCount").innerHTML = "Выберите объекты щелчком мыши";
			dijit.byId("identifyPanelMain").set("content", "");
			dojo.style (dojo.byId ('identifyPanelButtons'), 'display', 'none');		
		}		
    });

    dojo.connect(map.infoWindow, "onSetFeatures", function(){
		if (activeTool == 'identify')
		{
			displayPopupContent(map.infoWindow.getSelectedFeature());
			dojo.byId("identifyPanelFeatureCount").innerHTML = 'Найдено объектов: ' + map.infoWindow.features.length;

			if (map.infoWindow.features.length > 1)
			{
				dojo.style (dojo.byId('identifyPanelButtons'), 'display', 'block');
			}
			else
			{
				dojo.style (dojo.byId('identifyPanelButtons'), 'display', 'none');						
			}
		}
    });	
}

function ShowFeatureLayerInfoWindow (evt)
{
	lastClickedMapPoint = evt.mapPoint;
	
	var layer = evt.graphic.getLayer();
	var feature = evt.graphic;
	
	map.infoWindow.clearFeatures();
	
	for (var i = 0; i < config.map.layers.length; i++)
	{
		if (config.map.layers[i].id == layer.id)
		{
			var popup = config.map.layers[i].popup;
			BuildFeaturePopup (feature, popup);			
			var features = [feature];
			lostFeature = feature;
			map.infoWindow.setFeatures (features);
			break;
		}		
	}
}

function OnMapLoad (evt)
{
	dojo.connect(dijit.byId('map'), 'resize', map, resizeMap);
}

function OnMapClick(evt) 
{	
	if (activeTool == 'edit')
	{		
		if (map.selectedLayers.length > 0)
		{
			editorWidget.drawingToolbar.deactivate();
			
			for (var j = 0; j < map.selectedLayers.length; j ++)
			{
				map.selectedLayers[j].clearSelection();
			}
			
			map.selectedLayers = [];
			map.selectableLayerCount = 0;

			for (var i = 0; i < map.layerIds.length; i++)
			{
				map.getLayer(map.layerIds[i]).refresh();
			};
		}
		else
		{
			map.selectableLayerCount = 0;
			editDialog.show();
		}
	}
	
	if (activeTool == 'identify')
	{
		identifyDialog.show();
		
		var tasks = dojo.map(config.map.identifyLayers, function(layer) 
		{
			return new esri.tasks.IdentifyTask(layer.url);
		}); 
		
		var defTasks = dojo.map(tasks, function (task) 
		{
			return new dojo.Deferred();
		});

		var dlTasks = new dojo.DeferredList(defTasks); 
			
		dlTasks.then(
			function(res)
			{
				var results = [];
				
				for (var i = 0; i < res.length; i++)
				{
					id	= config.map.identifyLayers[i].id;
								
					for (var j = 0, countj = config.map.layers.length; j < countj; j ++)
					{
						if (id == config.map.layers[j].id)
						{
							for (var k = 0; k < res[i][1].length; k++)
							{
								sublayerID = res[i][1][k].layerId;
							
								for (var p = 0; p < config.map.layers[j].sublayers.length; p ++)
								{
									if (config.map.layers[j].sublayers[p].id == sublayerID)
									{
										var feature = res[i][1][k].feature;
										var popup   = config.map.layers[j].sublayers[p].popup;									
										BuildFeaturePopup (feature, popup);																		
										results.push (feature);
										break;
									}							
								}
							}
							
							break;
						}
					}
				}
					
				map.infoWindow.clearFeatures();				
				
				if ((lastClickedMapPoint != null) && (lastClickedMapPoint.x == evt.mapPoint.x) && (lastClickedMapPoint.y == evt.mapPoint.y) && (lastClickedMapPoint.spatialReference.wkid == evt.mapPoint.spatialReference.wkid) && (lostFeature != null))
				{
					results.push (lostFeature);
					lostFeature = null;
				}
								
				if (results.length > 0)
				{					
					map.infoWindow.setFeatures(results);					
				};
				
				identifyDialog.hide();
				return results;
			},
			function(err)
			{
			}
		);

		map.identifyParams.width = map.width;
		map.identifyParams.height = map.height;
		map.identifyParams.geometry = evt.mapPoint;
		map.identifyParams.mapExtent = map.extent;
	
		for (var i = 0; i < tasks.length; i++)
		{ 
			try 
			{
				var layer = map.getLayer (config.map.identifyLayers[i].id);
				map.identifyParams.layerDefinitions = layer.layerDefinitions;
				tasks[i].execute(map.identifyParams, defTasks[i].callback, defTasks[i].errback);
			} 
			catch (err) 
			{
				defTasks[i].errback(err); 
			}
		}      
	}
}

function LayersAddedToMap (results) 
{
	map['layers'] = [];
	
	for (var i = 0; i < results.layers.length; i ++)
	{
		
		if (results.layers[i].error == undefined)
		{
			map.layers.push (results.layers[i].layer);
		}
		else
		{
			errorDialog = new dijit.Dialog({
				title: "Ошибка",
				content: "Слой '" + results.layers[i].layer.title + "' не был добавлен на карту. Сервис не существует или недоступен." ,
				style: "width: 300px; color: red"
			});
		
			errorDialog.show();	
		}
	}
	
	ApplyLoginFilter();
	
	try
	{
		LoadWidgets();
	}
	catch (err)
	{
		errorDialog = new dijit.Dialog({
			title: "Ошибка",
			content: "Ошибка создания виджетов: </br>" + err.message ,
			style: "width: 300px; color: red"
		});
	
		errorDialog.show();
	}
	
	dijit.byId('outerContainer').resize();
	loadAppDialog.hide();
};

function ApplyLoginFilter()
{
	for (i = 0; i < map.layers.length; i ++)
	{
		layer = map.layers[i];
		
		if (layer.credential != undefined)
		{
			if (layer.layerDefinitions != undefined)
			{
				for (j = 0; j < layer.layerDefinitions.length; j ++)
				{
					if ((layer.layerDefinitions[j] != undefined) && (layer.layerDefinitions[j].indexOf("$login") >= 0))
					{
						layer.layerDefinitions[j] = layer.layerDefinitions[j].replace ('$login', "'" + layer.credential.userId + "'");
						
						n = layer.layerDefinitions[j].indexOf ("$skipLogins=");
						
						if ( n >= 0)
						{
							skipLoginsStr = layer.layerDefinitions[j].substring (n + 12, layer.layerDefinitions[j].length);
							skipLoginsArr = skipLoginsStr.split(",");

							if (skipLoginsArr.indexOf (layer.credential.userId) >= 0)
							{
								layer.layerDefinitions[j] = "";
							}
							else
							{
								layer.layerDefinitions[j] = layer.layerDefinitions[j].substring (0, n);
							}	
							layer.featureSubLayers[j].setDefinitionExpression (layer.layerDefinitions[j]);
						}						
					}
				}
				layer.setLayerDefinitions (layer.layerDefinitions);
			}
		}
		
	}		
}

function LoadWidgets() 
{
	activeTool = '';
	
	if (config.widgets == undefined)
	{
		dijit.byId ("outerContainer").removeChild (dijit.byId ("tools"));		
		dijit.byId ("outerContainer").removeChild (dijit.byId ("props"));	
		return -1;
	}
	
	// Инструменты
	if (config.widgets.editor != undefined)
	{
		try
		{
			AddEditorWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (400, "Ошибка создания виджета редактирования.");
		}
	}
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("editorPanel"));
	}
	
	if (config.widgets.measure != undefined )
	{
		try
		{
			var flSnapping = false;
			
			for (var i = 0; i < map.layers.length; i++)
			{
				if (map.layers[i].snapping)
				{
					flSnapping = true;
					break;
				}
			}	

			if (flSnapping)
			{
				map['snapManager'] = map.enableSnapping({snapKey:dojo.keys.copyKey});
			}
			else
			{
				map['snapManager'] = null;
			}
		
			AddMeasureWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (401, "Ошибка создания виджета измерений по карте.");
		}
	}	
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("measurePanel"));
	}
		
	if (config.widgets.identify != undefined)
	{
		try
		{
			AddIdentifyWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (402, "Ошибка создания виджета идентификации.");
		}
	}	
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("identifyPanel"));
	}
	
	
	if (config.widgets.geocoder != undefined )
	{
		try
		{
			AddGeocoderWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (403, "Ошибка создания виджета геокодирования.");
		}
	}
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("geocoderPanel"));
	}
	
	if (config.widgets.route != undefined)
	{
		try
		{
			AddRouteWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (404, "Ошибка создания виджета прокладки маршрута.");
		}
	}
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("routePanel"));
	}
	
		
	if (config.widgets.print != undefined )
	{
		try
		{
			AddPrintWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (405, "Ошибка создания виджета печати.");
		}
	}
	else
	{
		dijit.byId ("toolsContainer").removeChild (dijit.byId ("printPanel"));
	}
						
	if (dijit.byId ("toolsContainer").getChildren().length == 0)
	{	
		dijit.byId ('outerContainer').removeChild (dijit.byId ('tools'));
	}
	else
	{
		
		SetActiveTool(dijit.byId ("toolsContainer").selectedChildWidget.id);
	}	
		
	// Отображение и информация
	if (config.widgets.gallery != undefined )
	{
		try
		{
			AddBasemapGalleryWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (406, "Ошибка создания виджета выбора базовой карты.");
		}
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("basemapPanel"));
	}
	
	if (config.widgets.legend != undefined)
	{
		try
		{
			AddLegendWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (407, "Ошибка создания виджета легенды.");
		}
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("legendPanel"));
	}
	
	if (config.widgets.toc != undefined)
	{
		try
		{
			AddTocWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (408, "Ошибка создания виджета таблицы содержания.");
		}
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("tocPanel"));
	}
	
	if (config.widgets.bookmarks!= undefined)
	{
		try
		{
			AddBookmarksWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (409, "Ошибка создания виджета закладок.");
		}
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("bookmarkPanel"));
	}
	
	if (config.widgets.details != undefined)
	{
		try
		{
			AddDetailsWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (410, "Ошибка создания виджета дополнительной информации.");
		}	
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("infoPanel"));
	}
	
	
	if (config.widgets.dateFilter!= undefined)
	{
		try
		{
			AddDateFilterWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (411, "Ошибка создания виджета фильтрации объектов по дате.");
		}
	}	
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("dateFilterPanel"));
	}
	
	if (dijit.byId ("propsContainer").getChildren().length == 0)
	{
		dijit.byId ('outerContainer').removeChild (dijit.byId ('props'));
	};
	
	// Scalebar & Overview
	
	if (config.widgets.scalebar != undefined)
	{
		try
		{
			AddScaleBarWidget();
		}
		catch (err)
		{
			throw new AGSViewerException (412, "Ошибка создания виджета масштабной линейки.");
		}
	}
				
	if (config.widgets.overviewmap != undefined)
	{
		try
		{
			AddOverviewWidget(false);
		}
		catch (err)
		{
			throw new AGSViewerException (413, "Ошибка создания виджета обзорного окна карты.");
		}
	}	

	dojo.connect (dijit.byId ('toolsContainer'), 'selectChild', ToolsTabSelected);
	
	return 0;
}

function AddLegendWidget() 
{
	var layerInfos = [];
	
	for (var i = 0; i < map.layers.length; i++)
	{
		if (map.layers[i].legend)
		{
			layerInfos.push (
				{
					layer    : map.layers[i],
					title    : map.layers[i].title
				}
			);
		}
	}
	
	var legend = new esri.dijit.Legend({
		map        : map,
		layerInfos : layerInfos,
		autoUpdate : true,
		id         : 'legend'
	}, 'legendPanel');
	
	legend.startup();
}

function AddRouteWidget()
{
	map ['routeLayer'] = new esri.layers.GraphicsLayer();
	map.addLayer (map.routeLayer);
			
	if ((config.tasks.geocoder != undefined) && (! config.tasks.geocoder.arcgisGeocoder))
	{
		var locatorUrl = config.tasks.geocoder.url;
		
		var geocoders = [{
			url  :  config.tasks.geocoder.url,
			singleLineFieldName :  config.tasks.geocoder.singleLineFieldName,
			name : "geocoder_for_directions"
		}];
		
		var	geocoderOptions = {
			autocomplete: true,
			arcgisGeocoder: false,
			geocoders: geocoders
		}
	}
	else
	{
		var locatorUrl = '';
		var geocoderOptions = {};
	}
	
	if (config.tasks.route.url != undefined)
	{
		var routeTaskUrl = config.tasks.route.url;
	}
	else
	{
		var routeTaskUrl = '';
	}
	
	
	var routeDijit = new esri.dijit.Directions({
		map: map,
		alphabet: ["А" , "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х"],
		routeParams: {
			directionsLanguage: "ru-RU",
			returnRoutes: true
		},
		routeTaskUrl : routeTaskUrl,
		locatorUrl : locatorUrl,
		geocoderOptions: geocoderOptions,
		id : "routeDijit"
	}, 'route');
		
	//dijit.byId ('routePanel').addChild (routeDijit);
	routeDijit.startup();
	
	dojo.connect (routeDijit, "onDirectionsFinish", DirectionsFinish);
}

function DirectionsFinish (res)
{
	if (res.routeResults[0].directions.mergedGeometry.paths[0][0] != [Infinity, Infinity])
	{
		res.routeResults[0].route.setSymbol (config.widgets.route.routeSymbol);
		map.routeLayer.clear();
		map.routeLayer.add (res.routeResults[0].route);
	};
}

function AddTocWidget() 
{  
	var layerInfos = [];
	
	for (var i = 0; i < map.layers.length; i++)
	{
		if (map.layers[i].toc)
		{
			layerInfos.push (
				{
					layer    : map.layers[i],
					title    : map.layers[i].title,
					slider   : map.layers[i].tocSlider,
					noLegend : ! map.layers[i].tocLegend
				}
			);
		}
	}
	
	var toc = new agsjs.dijit.TOC({
        map        : map,
		layerInfos : layerInfos,
		style      : 'standard',
		id         : 'toc'
    }, 'toc');
	
	toc.startup();	  
}


function AddEditorWidget() 
{
	editorWidget = null;
	map.selectedLayers = [];
	map.selectableLayerCount = 0;
}

function AddDetailsWidget()
{
	dijit.byId ('infoPanel').domNode.innerHTML = config.widgets.details.html;
}

function resizeMap() 
{
	if (map) 
	{
		map.resize();
		map.reposition();
	}
}


function AddBasemapGalleryWidget() 
{   
	var basemaps= [];
	
	for (var i = 0, counti = config.map.basemaps.length; i < counti; i++)
	{
		if (config.map.basemaps[i].gallery)
		{
			layers = [];
			
			for (var j = config.map.basemaps[i].layers.length - 1; j >= 0; j--)
			{
				if ((config.map.basemaps[i].layers[j].token != "") && (config.map.basemaps[i].layers[j].token != undefined))
				{
					url = config.map.basemaps[i].layers[j].url + "?token=" + config.map.basemaps[i].layers[j].token
				}
				else
				{
					url = config.map.basemaps[i].layers[j].url
				}

				layer = new esri.dijit.BasemapLayer ({url: url});		
				layers.push (layer);					
			}
			
			var basemap = new esri.dijit.Basemap ({
				id     : config.map.basemaps[i].id,
				layers : layers,
				title  : config.map.basemaps[i].title,
				thumbnailUrl : config.map.basemaps[i].galleryimg
			});
			
			basemaps.push (basemap);
		}		
	}	
	
	if (config.widgets.gallery.googlemaps)
	{
		var basemapGallery = new esri.dijit.BasemapGallery({
			showArcGISBasemaps: config.widgets.gallery.arcgismaps,
			google: {
                apiOptions: {
                    v: '3.6' // use a specific version is recommended for production system.
                },
				mapOptions: {
					streetViewControl: false
				}
            },
			basemaps:basemaps,
			map:map
		}, dojo.create ('div'));
	}
	else
	{
		var basemapGallery = new esri.dijit.BasemapGallery({
			showArcGISBasemaps: config.widgets.gallery.arcgismaps,
			basemaps:basemaps,
			map:map
		}, 'basemapPanel');
	}
	
	dijit.byId ('basemapPanel').set('content', basemapGallery.domNode);

	dojo.connect(basemapGallery, "onSelectionChange", function () {
		destroyOverview();
	});

	basemapGallery.startup();
}

function AddPrintWidget() 
{
	var layoutOptions ={
		'authorText':config.widgets.print.owner,
		'titleText': config.widgets.print.title,
		'scalebarUnit': 'Kilometers',
		'legendLayers':[]
    };

	printlayouts = [{
          layout:'Letter ANSI A Landscape',
          label:'Альбомная (PDF)',
          format:'PDF'
        },{
          layout:'Letter ANSI A Portrait',
          label:'Книжная (PDF)',
          format:'PDF'
        },{
          layout:'Letter ANSI A Landscape',
          label:'Альбомная (Изображение)',
          format:'PNG32'
        },{
          layout:'Letter ANSI A Portrait',
          label:'Книжная (Изображение)',
          format:'PNG32'
        }];
		
    var templates = dojo.map(printlayouts,function(layout){
		layout.layoutOptions = layoutOptions;
		return layout;
    });
    
	var printer = new esri.dijit.Print({
      map       : map,
      templates : templates,
      url       : config.tasks.print.url,
	  id        : "printBtn"
    }, dojo.byId("print"));
    
	printer._printText    = "Экспортировать в веб-файл";
	printer._printingText = "Идет экспорт ...";
	printer._printoutText = "Открыть веб-файл";
    printer.startup();
}

function AddDateFilterWidget()
{		
	dojo.style (dijit.byId('dateFilterPanel').domNode, 'display', 'block');
}


function AddScaleBarWidget()
{
	var scalebar = new esri.dijit.Scalebar({
		map: map,
		scalebarUnit: 'metric'
	});
}

function AddMeasureWidget() 
{
	measure = new esri.dijit.Measurement({
		map: map,
		id: 'measure',
		defaultAreaUnit: esri.Units.SQUARE_KILOMETERS,
		defaultLengthUnit: esri.Units.KILOMETERS
	}, dojo.create ('div'));
	
	if (map.snapManager != null)
	{
		var span = dojo.create('snap', {
			innerHTML: "<hr> Нажмите <b> CTRL </b> для притяжки",
			style:"font-size:11px;padding:5px 5px;"
		});

		dijit.byId ('measure').domNode.appendChild (span);
	}
	
	dijit.byId ('measurePanel').addChild (measure);
	measure.startup();
}

function AddBookmarksWidget()
{
	var bookmarkItems = [];
	
	for (var i = 0; i < config.widgets.bookmarks.bookmarks.length; i ++)
	{
		var extent = new esri.geometry.Extent (parseInt (config.widgets.bookmarks.bookmarks[i].extent.xmin), 
		                                       parseInt (config.widgets.bookmarks.bookmarks[i].extent.ymin), 
											   parseInt (config.widgets.bookmarks.bookmarks[i].extent.xmax), 
											   parseInt (config.widgets.bookmarks.bookmarks[i].extent.ymax), 
											   map.spatialReference);
											   
		bookmarkItems.push ({name : config.widgets.bookmarks.bookmarks[i].title, extent: extent});
	}
	
		
	var bookmarks = new esri.dijit.Bookmarks({
        map: map,
		editable : config.widgets.bookmarks.editable,
        bookmarks: bookmarkItems,
		id : 'bookmarks'
    }, 'bookmarkPanel');
}

function AddIdentifyWidget()
{
	dojo.style (dijit.byId('identifyPanel').domNode, 'display', 'block');
	
	lastClickedMapPoint = null;
    lostFeature = null;
	
	map ['identifyParams'] = new esri.tasks.IdentifyParameters();
    map.identifyParams.tolerance = config.widgets.identify.tolerance;
	map.identifyParams.returnGeometry = true;
    map.identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;	
}

function AddOverviewWidget(isVisible) 
{
	var overviewMapDijit = new esri.dijit.OverviewMap({
		map: map,
		attachTo: "top-right",
		opacity: 0.5,
		color: "#000000",
		expandfactor: 2,
		maximizeButton: false,
		visible: isVisible,
		id: 'overviewMap'
	});
	
	overviewMapDijit.startup();
}

function destroyOverview() {
  var ov = dijit.byId('overviewMap');
  if (ov) {
    var vis = ov.visible;
    ov.destroy();
    addOverview(vis);
  }
}

function createEditor() 
{
	if (editorWidget) 
	{
		return;
	}
	
	var layerInfos = [];
	var tpLayerInfos = [];
	
	for (var i = 0; i < map.layers.length; i++)
	{
		if (map.layers[i].edit)
		{
			layerInfos.push (
				{
					featureLayer : map.layers[i],
					fieldInfos   : map.layers[i].editFieldInfos
				}
			);
			
			tpLayerInfos.push (map.layers[i]);
		}
	}	
	
	
	if (layerInfos.length > 0) 
	{
		var eDiv = dojo.create("div", {
			id: "editDiv"
		});
		
		var tDiv = dojo.create("div", {
			id: "templateDiv"
		});
		
		var bc = new dijit.layout.BorderContainer({
			style: "height: 100%; width: 100%;",
			id : "editorBC"
		});
		
		dijit.byId ('editorPanel').addChild (bc);		

		var cp2 = new dijit.layout.ContentPane({
			region: "bottom",
			style: "width: 100%",
			id : "editCP"
		});
		
		cp2.set ('content', eDiv);
		bc.addChild(cp2);		
		
		var cp1 = new dijit.layout.ContentPane({
			region: "center",
			style: "height: 100%; width: 100%",
			id : "templateCP"
		});
		cp1.set ('content', tDiv);	
		bc.addChild(cp1);
			
		var templatePicker = new esri.dijit.editing.TemplatePicker({
            featureLayers: tpLayerInfos,
            rows: 'auto',
            columns: 'auto',
            grouping: true,
            showTooltip: false,
            style: "height: 100%; width: 100%"
        }, "templateDiv");
        templatePicker.startup();
		
		if ((config.widgets.editor.toolbar) && (config.widgets.editor.tools != null))
		{
		
			var createOptions = {polylineDrawTools: [], polygonDrawTools: []};
		
			for (var i = 0; i < config.widgets.editor.tools.polylineDrawTools.length; i ++)
			{
				if (config.widgets.editor.tools.polylineDrawTools[i] == 'POLYLINE')
				{
					createOptions.polylineDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_POLYLINE);
				}
				
				if (config.widgets.editor.tools.polylineDrawTools[i] == 'FREEHAND_POLYLINE')
				{
					createOptions.polylineDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_FREEHAND_POLYLINE);
				}
			}
		
			for (var i = 0; i < config.widgets.editor.tools.polygonDrawTools.length; i ++)
			{
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'POLYGON')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_POLYGON);
				}
				
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'FREEHAND_POLYGON')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_FREEHAND_POLYGON);
				}
				
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'AUTOCOMPLETE')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_AUTOCOMPLETE);
				}
							
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'CIRCLE')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_CIRCLE);
				}
				
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'RECTANGLE')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_RECTANGLE);
				}
				
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'TRIANGLE')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_TRIANGLE);
				}
				
				if (config.widgets.editor.tools.polygonDrawTools[i] == 'ELLIPSE')
				{
					createOptions.polygonDrawTools.push (esri.dijit.editing.Editor.CREATE_TOOL_ELLIPSE);
				}
			}

			var settings = {
				map: map,
				templatePicker: templatePicker,
				layerInfos: layerInfos,
				toolbarVisible: true,
				createOptions : createOptions,
				toolbarOptions: {
					reshapeVisible: config.widgets.editor.tools.reshapeTool,
					cutVisible: config.widgets.editor.tools.cutTool,
					mergeVisible: config.widgets.editor.tools.mergeTool
				},
				enableUndoRedo : config.widgets.editor.tools.undoRedoTool,
				maxOperations  : config.widgets.editor.tools.undoRedoMaxOperations				
			};
		}
		else
		{
			var settings = {
				map: map,
				templatePicker: templatePicker,
				layerInfos: layerInfos,
				toolbarVisible: config.widgets.editor.toolbar		
			};
		}
		
				
        var params = {
            settings: settings
        };
		
        editorWidget = new esri.dijit.editing.Editor(params, "editDiv");
		
		var deleteButton = new dijit.form.Button({label:"Удалить", "class":"deleteButton"});
		var closeButton  = new dijit.form.Button({label:"Завершить", "class":"closeButton"});
	
		var node = editorWidget.attributeInspector.deleteBtn.domNode.parentNode;
		node.removeChild (editorWidget.attributeInspector.deleteBtn.domNode);
		node.appendChild (deleteButton.domNode);
		node.appendChild (closeButton.domNode);
				
		dojo.connect(closeButton,"onClick",function()
		{
			editorWidget.attributeInspector._currentFeature._graphicsLayer.applyEdits(null, [editorWidget.attributeInspector._currentFeature], null);    
			editorWidget.drawingToolbar.deactivate();
			
			map.infoWindow.hide();
			
			for (var j = 0; j < map.selectedLayers.length; j ++)
			{
				if (map.selectedLayers[j] != null)
				{
					map.selectedLayers[j].clearSelection();
				}
			}
			
			map.selectedLayers = [];
			map.selectableLayerCount = 0;
			
			for(var i = 0; i < map.layerIds.length; i++)
			{
				map.getLayer(map.layerIds[i]).refresh();
			};			
		});
		
		dojo.connect(deleteButton,"onClick",function()
		{
			map.infoWindow.hide();
			editorWidget.attributeInspector._currentFeature._graphicsLayer.applyEdits(null, null, [editorWidget.attributeInspector._currentFeature]);         
			editorWidget.drawingToolbar.deactivate();
			editorWidget.attributeInspector._currentFeature._graphicsLayer.clearSelection();
			
			map.selectedLayers = [];
			map.selectableLayerCount = 0;
			
			for(var i = 0; i < map.layerIds.length; i++)
			{
				map.getLayer(map.layerIds[i]).refresh();
			};
		});		
		
        editorWidget.startup();
		bc.resize();
	}
	
	
}

function destroyEditor() 
{
	if (editorWidget) 
	{  	
		if ((editorWidget.attributeInspector != null) && (editorWidget.attributeInspector._currentFeature != null))
		{
			editorWidget.drawingToolbar.deactivate();
			editorWidget.attributeInspector._currentFeature._graphicsLayer.clearSelection();
		}
	
		editorWidget.destroy();
		editorWidget = null;
		
		dojo.destroy ("editDiv");
		dojo.destroy ("createDiv");		
		
		dijit.byId ("editorBC").removeChild (dijit.byId ("templateCP"));
		dijit.byId ("editorBC").removeChild (dijit.byId ("editCP"));
		dijit.byId ("templateCP").destroy(true);
		dijit.byId ("editCP").destroy(true);
		dijit.byId ('editorPanel').removeChild (dijit.byId ("editorBC"));
		dijit.byId ("editorBC").destroy(true);

	}
}

function AddGeocoderWidget() 
{
	map ['geocoderResultLayer'] = new esri.layers.GraphicsLayer();
	map.addLayer (map.geocoderResultLayer);
	dojo.connect (map.geocoderResultLayer, "onClick", geocoderResultLayerClick);
	
	map ['geocoderResultSymbol'] = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 14,
		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
		new dojo.Color([255,0,0]), 1),
		new dojo.Color([0,255,0,0.25]));

	if (config.tasks.geocoder.arcgisGeocoder)
	{
		geocoder = new esri.dijit.Geocoder({ 
			map: map,
			autoComplete: true,			
			arcgisGeocoder: {
				placeholder: "Введите текст"
			}
		}, 'search');
	}
	else
	{
		var geocoders = [{
            url  : config.tasks.geocoder.url,
			singleLineFieldName : config.tasks.geocoder.singleLineFieldName,
            name : "geocoder",
			placeholder: "Введите адрес",
        }];
		
		geocoder = new esri.dijit.Geocoder({
			map: map,
			autocomplete: true,
			arcgisGeocoder: false,			
			geocoders: geocoders
        }, 'search');
		
		
	}

	dojo.connect (geocoder, "onFindResults", GeocoderOnFindResults);
	dojo.connect (geocoder, "onClear", GeocoderClear);
	dojo.connect (geocoder, "onSelect", GeocoderSelect);
	geocoder.startup();
}

function GeocoderOnFindResults (results)
{
	map.geocoderResultLayer.clear();
	
	if (results.results.length > 0)
	{
		results.results[0].feature.setSymbol (map.geocoderResultSymbol);
		results.results[0].feature.attributes ['name'] = results.results[0].name;
		map.geocoderResultLayer.add (results.results[0].feature);
		map.centerAndZoom(results.results[0].feature, 16);
	}	
}

function GeocoderClear ()
{
	map ['geocoderResultLayer'].clear();
}

function GeocoderSelect (results)
{

}

function geocoderResultLayerClick (evt)
{
	map.infoWindow.setTitle  ("Информация о найденном объекте");
	map.infoWindow.setContent (evt.graphic.attributes.name);
	map.infoWindow.show (evt.mapPoint);	
}

function GeocoderOnAutoCompleteResults (results)
{
	geocoder.select (results.results[0]);
}

function ApplyTimePicker()
{
	date = new Date (dijit.byId('datePicker').value);
	dateFrom = formatDate(date, 'yyyy-MM-dd 00:00:00');
	
	date.setDate (date.getDate() + 1);
	dateTo   = formatDate(date, 'yyyy-MM-dd 00:00:00');	
	
	for(var i = 0; i < map.layers.length; i++)
	{
		var layer = map.layers[i];
		
		if (layer.dateFilter)
		{
			var ld = [];
		
			if (layer.layerDefinitions != undefined)
			{
				if (layer['oldLayerDefinitions'] != undefined)
				{
					layer.layerDefinitions = layer['oldLayerDefinitions'];
				}
				
				layer['oldLayerDefinitions'] = layer.layerDefinitions;
			
				for (j = 0; j < layer.layerDefinitions.length; j ++)
				{
					if (layer.layerDefinitions[j] == '')
					{
						ld[j] = config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'";
					}
					else
					{
						ld[j] = layer.layerDefinitions[j] + " AND " + config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'";
					}
				
					layer.featureSubLayers[j].setDefinitionExpression (ld[j]);
				}
			
				layer.setLayerDefinitions (ld);
			}
		
			if (layer.type == "Feature Layer")
			{
				if (layer['oldLayerDefinition'] != undefined)
				{
					layer.setDefinitionExpression (layer['oldLayerDefinition']);
				}
				
				layer['oldLayerDefinition'] = layer.getDefinitionExpression();
			
				if (layer['oldLayerDefinition'] == '')
				{
					layer.setDefinitionExpression (config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'");
				}
				else
				{
					layer.setDefinitionExpression (layer['oldLayerDefinition'] + " AND " + config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'");
				}
			}
		}	
	}
	
	dijit.byId("btnTimePickerApply").setAttribute ("disabled", true);
	dijit.byId("btnTimePickerReset").setAttribute ("disabled", false);
}

function ApplyTimePickerDbl()
{
	date1 = new Date (dijit.byId('datePickerDbl1').value);
	dateFrom = formatDate(date1, 'yyyy-MM-dd 00:00:00');
	
	date2 = new Date (dijit.byId('datePickerDbl2').value);
	date2.setDate (date2.getDate() + 1);
	dateTo   = formatDate(date2, 'yyyy-MM-dd 00:00:00');	
	
	for(var i = 0; i < map.layers.length; i++)
	{
		var layer = map.layers[i];
		
		if (layer.dateFilter)
		{
			var ld = [];
		
			if (layer.layerDefinitions != undefined)
			{
				if (layer['oldLayerDefinitions'] != undefined)
				{
					layer.layerDefinitions = layer['oldLayerDefinitions'];
				}
				
				layer['oldLayerDefinitions'] = layer.layerDefinitions;
			
				for (j = 0; j < layer.layerDefinitions.length; j ++)
				{
					if (layer.layerDefinitions[j] == '')
					{
						ld[j] = config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + "< '" + dateTo + "'";
					}
					else
					{
						ld[j] = layer.layerDefinitions[j] + " AND " + config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'";
					}
				
					layer.featureSubLayers[j].setDefinitionExpression (ld[j]);
				}
			
				layer.setLayerDefinitions (ld);
			}
		
			if (layer.type == "Feature Layer")
			{
				if (layer['oldLayerDefinition'] != undefined)
				{
					layer.setDefinitionExpression (layer['oldLayerDefinition']);
				}
				
				layer['oldLayerDefinition'] = layer.getDefinitionExpression();
			
				if (layer['oldLayerDefinition'] == '')
				{
					layer.setDefinitionExpression (config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'");
				}
				else
				{
					layer.setDefinitionExpression (layer['oldLayerDefinition'] + " AND " + config.widgets.dateFilter.field + " >= '" + dateFrom + "' AND " + config.widgets.dateFilter.field + " < '" + dateTo + "'");
				}
			}
		}
	}
	
	dijit.byId("btnTimePickerApplyDbl").setAttribute ("disabled", true);
	dijit.byId("btnTimePickerResetDbl").setAttribute ("disabled", false);
}

function ResetTimePicker()
{
	for(var i = 0; i < map.layers.length; i++)
	{
		var layer = map.layers[i];
		
		if (layer.dateFilter)
		{
			if (layer.layerDefinitions != undefined)
			{
				layer.setLayerDefinitions (layer['oldLayerDefinitions']);
			
				for (var j = 0; j < layer.layerDefinitions.length; j ++)
				{
					layer.featureSubLayers[j].setDefinitionExpression (layer.layerDefinitions[j]);
				}
			}
		
			if (layer.type == "Feature Layer")
			{
				layer.setDefinitionExpression (layer['oldLayerDefinition']);
			}
		}
	}
	
	dijit.byId("datePicker").setAttribute ("value", null);
	dijit.byId("btnTimePickerApply").setAttribute ("disabled", true);
	dijit.byId("btnTimePickerReset").setAttribute ("disabled", true);
}

function ResetTimePickerDbl()
{
	for(var i = 0; i < map.layers.length; i++)
	{
		var layer = map.layers[i];
		
		if (layer.dateFilter)
		{
			if (layer.layerDefinitions != undefined)
			{
				layer.setLayerDefinitions (layer['oldLayerDefinitions']);
			
				for (var j = 0; j < layer.layerDefinitions.length; j ++)
				{
					layer.featureSubLayers[j].setDefinitionExpression (layer.layerDefinitions[j]);
				}
			}
		
			if (layer.type == "Feature Layer")
			{
				layer.setDefinitionExpression (layer['oldLayerDefinition']);
			}
		}
	}
	
	dijit.byId("datePickerDbl1").setAttribute ("value", null);
	dijit.byId("datePickerDbl2").setAttribute ("value", null);
	dijit.byId("btnTimePickerApplyDbl").setAttribute ("disabled", true);
	dijit.byId("btnTimePickerResetDbl").setAttribute ("disabled", true);
}

function DateChanged()
{
	dijit.byId("btnTimePickerApply").setAttribute ("disabled", false);
}


function Date1DblChanged()
{
	dijit.byId("btnTimePickerApplyDbl").setAttribute ("disabled", false);
}

function Date2DblChanged()
{
	dijit.byId("btnTimePickerApplyDbl").setAttribute ("disabled", false);
}

function AGSViewerException(code, message) {
   this.code = code;
   this.message = message;
   this.name = "AGSViewerException";
}

function ToolsTabSelected (evt)
{	
	if (activeTool == 'measure') 
	{
		var measure = dijit.byId('measure');
		measure.clearResult();
			
		if (map.snapManager != null)
		{
			map.snapManager.setLayerInfos([]);
		}
	}
	
	if (activeTool == 'identify') 
	{
		map.infoWindow.clearFeatures();
	}	
	
	if (activeTool == 'edit')
	{
		destroyEditor();
	}
	
	if (activeTool == 'geocoder')
	{
		map.geocoderResultLayer.clear();
		map.infoWindow.hide();
	}
	
	if (activeTool == 'route')
	{
		dijit.byId ('routeDijit').reset();
		map.routeLayer.clear();		
	}
	
	
	SetActiveTool (evt.id);
}

function SetActiveTool (panelId)
{
	switch (panelId) 
	{
		case 'identifyPanel':
			activeTool = 'identify';
			break;
		case 'editorPanel':
			activeTool = 'edit';
			createEditor();
			break;
		case 'measurePanel':
			activeTool = 'measure';		

			if (map.snapManager != null)
			{
				var layerInfos = [];
			
				for (var i = 0; i < map.layers.length; i++)
				{
					if (map.layers[i].snapping) 
					{
						layerInfos.push ({layer : map.layers[i]});
					}
				}	
				
				map.snapManager.setLayerInfos (layerInfos);
			}
			
			break;
		case 'geocoderPanel':
			activeTool = 'geocoder';
			break;
		case 'routePanel':
			activeTool = 'route';
			break;
		case 'printPanel':
			activeTool = 'print';
			break;
		default:
			activeTool = '';
			break;
	}
}

function IdentifyPanelSelectPrevious()
{
	map.infoWindow.selectPrevious();
}

function IdentifyPanelSelectNext()
{
	map.infoWindow.selectNext();
}

function displayPopupContent (feature)
{
	if (feature)
	{
        var content = feature.getContent();
        dijit.byId ('identifyPanelMain').set('content', content);
		
		for (var i = 0; i < feature.media.length; i ++)
		{
			if (feature.media[i].type == "chart")
			{
				var titleDiv = dojo.create ("div");
				titleDiv.innerHTML = "<hr><B>" + feature.media[i].chart.title + '</B></br></br>';
				var chartDiv = dojo.create ("div", {region : "center"});
				var legendDiv = dojo.create ("div", {region : "center"});
				var chart = new dojox.charting.Chart(chartDiv);
				chart.setTheme (dojox.charting.themes.Claro);
				dijit.byId ('identifyPanelMain').domNode.appendChild (titleDiv);
				dijit.byId ('identifyPanelMain').domNode.appendChild (chartDiv);
				dijit.byId ('identifyPanelMain').domNode.appendChild (legendDiv);
				
				chart.addPlot("default", {type: feature.media[i].chart.type, markers : true, labelOffset: -20});
								
				if (feature.media[i].chart.labels != [])
				{
					chart.addAxis("x", {labels : feature.media[i].chart.labels});
				};
				
				chart.addAxis("y", {vertical: true, min: 0});
				
				var tooltip = new dojox.charting.action2d.Tooltip(chart, "default");
				
				if ((feature.media[i].chart.type == "Markers") || (feature.media[i].chart.type == "MarkersOnly"))
				{
					var mag = new dojox.charting.action2d.Magnify(chart, "default");
				};
				
			
				if (feature.media[i].chart.type == "Columns")
				{
					var highlight = new dojox.charting.action2d.Highlight(chart, "default");
				};
				
				chart.addSeries("Series_" + i, feature.media[i].chart.series);				
				
				chart.render();
				
				if (feature.media[i].chart.type == "Pie")
				{
					var msl = new dojox.charting.action2d.MoveSlice(chart,"default");
					var legend = new dojox.charting.widget.Legend({ chart: chart }, legendDiv);
				}
			}
		}
		
		dijit.byId ('identifyPanelMain').resize();
	}
}			

function BuildFeaturePopup (feature, popup)
{
	if (popup.fieldInfos.length == 0)
	{
		var template = new esri.dijit.PopupTemplate({
			title: popup.title,
			description: popup.description
		});
	}
	else
	{
		var template = new esri.dijit.PopupTemplate({
			title: popup.title,
			fieldInfos: popup.fieldInfos 
		});
	}
	
	if ( popup.mediaInfos != null)
	{
		feature['media'] = [];
		
		for (var m = 0; m < popup.mediaInfos.list.length; m ++)
		{
			var mediaInfo = popup.mediaInfos.list[m];
			var media = new Object;
			media.chart = new Object;
			media.type = "chart";
			media.chart.type  = mediaInfo.subtype;
			media.chart.title = mediaInfo.title;
			var labels = [];
			var series = [];
													
			for (f = 0; f < mediaInfo.value.fields.length; f ++)
			{
				if (feature.attributes[mediaInfo.value.fields[f]] != null)
				{
					series.push ({y: parseInt (feature.attributes[mediaInfo.value.fields[f]]), legend : mediaInfo.xlabels[f], tooltip : mediaInfo.xlabels[f] + ' : ' + feature.attributes[mediaInfo.value.fields[f]]});
												
					if (mediaInfo.xlabels != undefined)
					{
						labels.push ({value: f + 1 , text : mediaInfo.xlabels[f]});
					}
				}
				else
				{
					series.push ({y: 0, tooltip: "Нет данных"});
													
					if (mediaInfo.xlabels != undefined)
					{
						labels.push ({value: f + 1, text : mediaInfo.xlabels[f] + " (н/д)"});
					}
				}
			}		

			media.chart.series = series;
			media.chart.labels = labels;													
			feature.media.push (media);
		}
	}
	else
	{
		feature.media = [];
	}
			
	feature.setInfoTemplate(template);
}