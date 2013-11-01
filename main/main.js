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
dojo.require("dojo.data.ItemFileWriteStore");

// esri 
dojo.require("esri.map");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.tasks.locator");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Measurement");
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
dojo.require("dojo.fx");

//other
dojo.require("app.OAuthHelper");

function ShowError (type, message)
{
	if (type == 0)
	{
		var title = "Ошибка при разборе config.xml.";
	};
	
	if (type == 1)
	{	
		var title = "Ошибка при загрузке карты.";
	};
	
	if (type == 2)
	{
		var title = 'Ошибка при загрузке слоя.';
	};
	
	var errorDialog = new dijit.Dialog({
		title: title,
		content: message,	
		style: "width: 300px; color: red"
	});
	
	errorDialog.show();
	
	if (type != 2)
	{
		loadAppDialog.hide();
	}
	
	window.close();
}

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
	
	geocoderDialog =  new dijit.Dialog ({
			content : "Поиск ...",
			closable : false
	});
	
	dojo.style(geocoderDialog.closeButtonNode,"display","none");
	
	loadAppDialog.show();

	if ( ! ParseConfig() )
	{
		exit;
	}
	
	Design();
	
	if (config.portal == undefined)
	{
		LoadMap();
	}
	else
	{
		Authorize();
	};
}

function ParseConfig()
{
	config  = new Object;
	var xmlhttp = new XMLHttpRequest();
	
	esri.config.defaults.io.corsEnabledServers.push(location.protocol + '//' + location.host);
	esri.config.defaults.io.corsEnabledServers.push("http://services.arcgis.com");
	esri.config.defaults.io.corsEnabledServers.push("https://services.arcgis.com");
		
	xmlhttp.open("GET","config.xml",false);
	xmlhttp.send();
	var xmlDoc=xmlhttp.responseXML;
	
	if (xmlDoc == null)
	{
		ShowError(0,'Файл config.xml не найден, пуст или содержит синтаксические ошибки. Приложение не будет запущено.');
		exit;
	}	
	
	var _design = xmlDoc.getElementsByTagName("design");
	var design = new Object;
	
	design.title = ((_design[0] == undefined) || (_design[0].getAttribute ('title') == undefined)) ? 'JavaScript Viewer for ArcGIS' : _design[0].getAttribute ('title');
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
	heading.fillimage = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('background') == undefined)) ? 'images/background.png' : _heading[0].getAttribute('background');
	heading.height = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('height') == undefined)) ? '63px' : _heading[0].getAttribute('height');
	heading.caption = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('caption') == undefined)) ? 'JavaScript Viewer for ArcGIS' : _heading[0].getAttribute('caption');
	heading.fontsize = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('font-size') == undefined)) ? '35pt' : _heading[0].getAttribute('font-size');
	heading.fontname = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('font-name') == undefined)) ? 'Arial' : _heading[0].getAttribute('font-name');
	heading.fontcolor = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('font-color') == undefined)) ? '#FFFFFF' : _heading[0].getAttribute('font-color');
	heading.bgcolor = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('background-color') == undefined)) ? '#0000FF' : _heading[0].getAttribute('background-color');
	heading.textalign = ((_heading == undefined) || (_heading[0] == undefined) || (_heading[0].getAttribute('text-align') == undefined)) ? 'left' : _heading[0].getAttribute('text-align');	
	design.heading = heading;
	config.design = design;
	
	var _portal = xmlDoc.getElementsByTagName ("portal");

	if (_portal[0] != undefined)
	{
		var portal            = new Object;
		portal.url            = (_portal[0].getAttribute("url") == undefined) ? 'http://www.arcgis.com' : _portal[0].getAttribute("url");
		portal.appID          = _portal[0].getAttribute("appID");
		portal.expiration     = _portal[0].getAttribute("expiration");
		portal.ssl            = _portal[0].getAttribute("ssl") == undefined ? true : _portal[0].getAttribute("ssl") == "true";
		 
		try
		{
			portal.expiration = parseInt (portal.expiration);
		}
		catch (err)
		{
			portal.expiration = 60;
		}
		
		portal.showPortalUser = (_portal[0].getAttribute("showPortalUser") == "true");
		
		if (portal.appID == undefined)
		{
			ShowError(0,'[portal]:не задан обязательный параметр appID.');
			exit;
		}
		
		config.portal = portal;
	};

	var _proxy = xmlDoc.getElementsByTagName("proxy");
	
	if (_proxy[0] != undefined)
	{
		esri.config.defaults.io.proxyUrl = (_proxy[0].getAttribute("useproxy") == "true");
		esri.config.defaults.io.proxyUrl = (_proxy[0].getAttribute("proxyUrl") == undefined) ? 'proxy.ashx' : _proxy[0].getAttribute("proxyUrl");
	}
	
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
	tasks.geocoder.arcgisGeocoder = (tasks.geocoder.url.indexOf ('geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer') >= 0);

	var _route = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("route") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("route");
	tasks.route = new Object;
	tasks.route.url = ((_route == undefined) || (_route[0] == undefined) || (_route[0].getAttribute("url") == undefined)) ? 'http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World' : _route[0].getAttribute("url");	
	
	var _print = ((_tasks[0] == undefined) || (_tasks[0].getElementsByTagName ("print") == undefined)) ? undefined : _tasks[0].getElementsByTagName ("print");
	tasks.print = new Object;
	tasks.print.url = ((_print == undefined) || (_print[0] == undefined) || (_print[0].getAttribute("url") == undefined)) ? 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task' : _print[0].getAttribute("url");	
		
	config.tasks = tasks;

	var _dijits = xmlDoc.getElementsByTagName("dijits");
	
	if (_dijits[0] != undefined)
	{
		var dijits  = new Object;	
		var _dijit  = _dijits[0].getElementsByTagName("dijit");
	
		dojo.forEach(_dijit, function (widget) 
		{
			if (widget.getAttribute("type") == "scalebar")
			{
				dijits.scalebar = new Object;
			}
		
			if (widget.getAttribute("type") == "print")
			{
				dijits.print = new Object;
				dijits.print.title   = (widget.getAttribute("title") == undefined) ? 'JavaScript Viewer for ArcGIS' : widget.getAttribute("title");
				dijits.print.owner   = (widget.getAttribute("owner") == undefined) ? 'Esri CIS' : widget.getAttribute("owner");
			}
				
			if (widget.getAttribute("type") == "basemaps")
			{
				dijits.gallery = new Object;
				dijits.gallery.arcgismaps = (widget.getAttribute("arcgismaps") == "true");
				dijits.gallery.googlemaps = (widget.getAttribute("googlemaps") == "true");
			}

			if (widget.getAttribute("type") == "measure")
			{
				dijits.measure = new Object;
			}

			if (widget.getAttribute("type") == "overview")
			{
				dijits.overviewmap = new Object;
			}

			if (widget.getAttribute("type") == "geocoder")
			{
				dijits.geocoder = new Object;
			}

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
						dijits.editor.tools.undoRedoMaxOperations = tools[0] == undefined ? 10 : parseInt (tools[0].getAttribute("undo-redoMaxOperations"))
					}
					catch (err)
					{
						dijits.editor.tools.undoRedoMaxOperations = 10;						
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
								ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]: Отсутствует обязательный параметр title.');
								exit;
							}
							
							var _extent = item.getElementsByTagName("extent");
							
							if (_extent[0] != undefined)
							{
								bookmark.extent = new Object;
								
								bookmark.extent.xmin = _extent[0].getAttribute("xmin");
								bookmark.extent.xmax = _extent[0].getAttribute("xmax");
								bookmark.extent.ymin = _extent[0].getAttribute("ymin");
								bookmark.extent.ymax = _extent[0].getAttribute("ymax");
								bookmark.extent.wkid = _extent[0].getAttribute("wkid");
										
								if (bookmark.extent.xmin == undefined)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]: Отсутствует обязательный параметр xmin.');
									exit;
								}
								
								try
								{
									bookmark.extent.xmin = parseFloat (bookmark.extent.xmin);									
								}
								catch (err)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]:Значение параметра xmin задано неправильно.');
									exit;
								}
										
								if (bookmark.extent.xmax == undefined)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]: Отсутствует обязательный параметр xmax.');
									exit;
								}
								
								try
								{
									bookmark.extent.xmax = parseFloat (bookmark.extent.xmax);									
								}
								catch (err)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]:Значение параметра xmax задано неправильно.');	
									exit;
								}
										
								if (bookmark.extent.ymin == undefined)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]: Отсутствует обязательный параметр ymin.');
									exit;
								}
								
								try
								{
									bookmark.extent.ymin = parseFloat (bookmark.extent.ymin);									
								}
								catch (err)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]:Значение параметра ymin задано неправильно.');	
									exit;
								}
										
								if (bookmark.extent.ymax == undefined)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]: Отсутствует обязательный параметр ymax.');
									exit;
								}		

								try
								{
									bookmark.extent.ymax = parseFloat (bookmark.extent.ymax);									
								}
								catch (err)
								{
									ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]:[extent]:Значение параметра ymax задано неправильно.');
									exit;
								}		

								try
								{
									bookmark.extent.wkid = parseInt (bookmark.extent.wkid);									
								}
								catch (err)
								{
									bookmark.extent.wkid = undefined;			
								}
								
								dijits.bookmarks.bookmarks.push (bookmark);						
							}
							else
							{
								ShowError (0,'[dijits]:[dijit type = "bookmarks"]:[bookmark]: Отсутствует обязательная секция [extent].');
								exit;
							}

						});
					};
				}
			}

			if (widget.getAttribute("type") == "toc")
			{
				dijits.toc = new Object;
			}

			if (widget.getAttribute("type") == "info")
			{
				dijits.details = new Object;
				dijits.details.html = widget.getAttribute("html");
			}

			
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
			
			if (widget.getAttribute("type") == "route")
			{
				dijits.route = new Object;
				dijits.route.routeSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([50, 0, 255]), 3);
			}
				
			if (widget.getAttribute("type") == "dateFilter")
			{
				dijits.dateFilter = new Object;
				dijits.dateFilter.limits = (widget.getAttribute("limits") == undefined) ? 'single' : widget.getAttribute("limits");
				dijits.dateFilter.field = widget.getAttribute("field");
		
				if (dijits.dateFilter.field == undefined)
				{
					ShowError (0,'[dijits]:[dijit type = "dateFilter"]: Отсутствует обязательный параметр field.');
					exit;
				}
			}

		});
	}
	else
	{
		var dijits = undefined;
	}
	
	config.widgets = dijits;
	
	var map = new Object;
	_map = xmlDoc.getElementsByTagName("map");
		
	if (_map[0] == undefined) 
	{
		ShowError (0,'Отсутствует обязательная секция [map].');
		exit;
	}
	
	_options = _map[0].getElementsByTagName ("options");
	
	var options = new Object;
	options.wkid = _options[0] == undefined ? undefined : _options[0].getAttribute("wkid");
	
	try
	{
		options.wkid = parseInt (options.wkid);
	}
	catch (err)
	{
		options.wkid = undefined;
	}
	
	options.slider = ((_options[0] == undefined) || (_options[0].getAttribute('slider') == undefined)) ? 'small' : _options[0].getAttribute("slider");
	options.basemap = (_options[0] == undefined) ? undefined : _options[0].getAttribute('basemap');
	options.logoVisible = ((_options[0] == undefined) || (_options[0].getAttribute("logoVisible") == "undefined")) ? true : (_options[0].getAttribute("logoVisible") == 'true');
	options.attributionVisible = ((_options[0] == undefined) || (_options[0].getAttribute("attributionVisible") == "undefined")) ? true : (_options[0].getAttribute("attributionVisible") == 'true');
			
	if (_options[0] != undefined)
	{
		var _extent = _options[0].getElementsByTagName ("extent");
	
		if (_extent[0] != undefined)
		{
			var extent = new Object;
			extent.xmin = _extent[0].getAttribute("xmin");
				
			if (extent.xmin == undefined)
			{
				ShowError (0,'[map]:[options]:[extent]: Отсутствует обязательный параметр xmin.');
				exit;
			}
				
			try
			{
				extent.xmin = parseFloat (extent.xmin);									
			}
			catch (err)
			{
				ShowError (0,'[map]:[options]:[extent]:Значение параметра xmin задано неправильно.');	
				exit;
			}
						
			extent.xmax = _extent[0].getAttribute("xmax");
			
			if (extent.xmax == undefined)
			{
				ShowError (0,'[map]:[options]:[extent]: Отсутствует обязательный параметр xmax.');
				exit;
			}		

			try
			{
				extent.xmax = parseFloat (extent.xmax);									
			}
			catch (err)
			{
				ShowError (0,'[map]:[options]:[extent]:Значение параметра xmax задано неправильно.');
				exit;
			}
						
			extent.ymin = _extent[0].getAttribute("ymin");
						
			if (extent.ymin == undefined)
			{
				ShowError (0,'[map]:[options]:[extent]: Отсутствует обязательный параметр ymin.');
				exit;
			}
			
			try
			{
				extent.ymin = parseFloat (extent.ymin);									
			}
			catch (err)
			{
				ShowError (0,'[map]:[options]:[extent]:Значение параметра уmin задано неправильно.');		
				exit;
			}
					
			extent.ymax = _extent[0].getAttribute("ymax");
						
			if (extent.ymax == undefined)
			{
				ShowError (0,'[map]:[options]:[extent]: Отсутствует обязательный параметр ymax.');
				exit;
			}			

			try
			{
				extent.ymax = parseFloat (extent.ymax);									
			}

			catch (err)
			{
				ShowError (0,'[map]:[options]:[extent]:Значение параметра ymax задано неправильно.');	
				exit;
			}
						
			options.extent = extent;	
		}
	}

	map.options = options;	
		
	map.basemaps = [];
	_basemaps = _map[0].getElementsByTagName("basemaps");
			
	if (_basemaps[0] != undefined)
	{
		_basemap  = _basemaps[0].getElementsByTagName("basemap");
			
		if (_basemap[0] != undefined)
		{		
			var item;
			
			dojo.forEach(_basemap, function (item) 
			{
				var basemap = new Object;
							
				basemap.id   		= item.getAttribute("id");
	
				if (basemap.id == undefined)
				{
					ShowError (0,'[map]:[basemaps]:[basemap]: Отсутствует обязательный параметр id.');
					exit;
				}
							
				basemap.title		= item.getAttribute("title");
							
				if (basemap.title == undefined)
				{
					ShowError (0,'[map]:[basemaps]:[basemap]: Отсутствует обязательный параметр title.');
					exit;
				}						
							
				basemap.image       = item.getAttribute("image");
							
				if (basemap.image == undefined)
				{
					ShowError (0,'[map]:[basemaps]:[basemap]: Отсутствует обязательный параметр image.');
					exit;
				}						
							
				basemap.layers     = [];
							
				_layers = item.getElementsByTagName("layers");
							
				if (_layers[0] == undefined)
				{
					ShowError (0,'[map]:[basemaps]:[basemap]: Отсутствует обязательная секция [layers].');
					exit;
				}
							
				_layer  = _layers[0].getElementsByTagName("layer");
							
				if (_layer[0] == undefined)
				{
					ShowError (0,'[map]:[basemaps]:[basemap]:[layers]: Отсутствует обязательная секция [layer].');
					exit;
				}
				
				var item1;
				
				dojo.forEach(_layer, function (item1) 
				{
					var layer   = new Object;
					layer.type    = item1.getAttribute("type");
										
					if (layer.type == undefined)
					{
						ShowError (0,'[map]:[basemaps]:[basemap]:[layers]:[layer]: Отсутствует обязательный параметр type.');
						exit;
					}
										
					layer.url     = item1.getAttribute("url");
					layer.portalID = item1.getAttribute("portalID"); 
										
					if ((layer.url == undefined) && (layer.portalID == undefined))
					{
						ShowError (0,'[map]:[basemaps]:[basemap]:[layers]:[layer]: Одновременно отсутствуют параметры url и portalID.');
						exit;
					}							
										
					layer.token   = item1.getAttribute("token");
					layer.opacity = item1.getAttribute("opacity");
					
					try
					{
						layer.opacity = parseFloat (layer.opacity);
					}
					catch (err)
					{
						layer.opacity = 1;
					};
					
					layer.id      = item1.getAttribute("id");
					basemap.layers.push (layer);
				});
				
				map.basemaps.push (basemap);
			});
		}
	}
			
	var _opLayers = _map[0].getElementsByTagName("mapLayers");
	
	if (_opLayers[0] == undefined)
	{
		ShowError (0,'[map]: Отсутствует обязательная секция [mapLayers].');
		exit;
	}
	
	var _layer    = _opLayers[0].getElementsByTagName("layer");
	
	if (_layer[0] == undefined)
	{
		ShowError (0,'[map]:[mapLayers]: Отсутствует обязательная секция [layer].');
		exit;
	}
	
	var edit  = new Object;
	var popup = new Object;			
	map.layers = [];
	map.identifyLayers = [];
	
	var item;
			
	dojo.forEach(_layer, function (item) 
	{
		var layer = new Object;
		layer.type     = item.getAttribute("type");
		
		if (layer.type == undefined)
		{
			ShowError (0,'[map]:[mapLayers]:[layer]: Отсутствует обязательный параметр type.');
			exit;
		}
		
		layer.id       = item.getAttribute("id");
		
		layer.url      = item.getAttribute("url");
		layer.portalID = item.getAttribute("portalID"); 
		
		if ((layer.url == undefined) && (layer.portalID == undefined))
		{
			ShowError (0,'[map]:[mapLayers]:[layer]: Одновременно отсутствуют параметры url и portalID.');
			exit;
		}

		layer.toc      = item.getAttribute("toc") == undefined ? true : item.getAttribute("toc") == "true";		
		layer.tocSlider  = item.getAttribute("tocSlider") == undefined ? false : item.getAttribute("tocSlider") == "true";
		layer.dateFilter = item.getAttribute("dateFilter") == undefined ? false : item.getAttribute("dateFilter") == "true"
		layer.visible  = item.getAttribute("visible") == undefined ? true : item.getAttribute("visible") == "true";
		layer.title    = item.getAttribute("title");
		layer.token    = item.getAttribute("token");	
		layer.opacity  = item.getAttribute("opacity");
		
		try
		{
			layer.opacity  = parseFloat (layer.opacity );
		}
		catch (err)
		{
			layer.opacity = 1;
		}
				
		if (layer.type == "dynamic")
		{
			var sublayers = [];
			var flIdentify = false;
					
			_sublayers = item.getElementsByTagName ("sublayers");
					
			if (_sublayers[0] != undefined)
			{
				var _sublayer = _sublayers[0].getElementsByTagName ("sublayer");
				
				var item1;
						
				dojo.forEach (_sublayer, function (item1)
				{
					var sublayer = new Object;
					sublayer.id = item1.getAttribute("id");
					
					try
					{
						sublayer.id = parseInt (sublayer.id);
					}
					catch (err)
					{
						ShowError (0,'[map]:[mapLayers]:[layer]:[sublayers]:[sublayer]:Параметр id задан неправильно (значение должно быть целым числом).');
						exit;
					}
					
					sublayer.definitionExpression = item1.getAttribute("definitionExpression");
					sublayer.visible = item1.getAttribute("visible") == undefined ? true : item1.getAttribute("visible") == "true";
					sublayer.title = item1.getAttribute("title");
				
					var _popup         = item1.getElementsByTagName("popup");
					
					
					if (_popup[0] != undefined)
					{
						flIdentify = true;
						var popup = new Object;		
					
						popup.title  = _popup[0].getAttribute("title");
						
						popup.content  = _popup[0].getAttribute("content");
						
						var _fields  = _popup[0].getElementsByTagName("fields");
						
						if (_fields[0] != undefined)
						{
							var _field  = _fields[0].getElementsByTagName("field");					
							var item2;
							var fields = [];
					
							dojo.forEach(_field, function(item2)
							{
								var field = new Object;
								field.fieldName = item2.getAttribute("name");
								
								if (field.fieldName == undefined)
								{
									ShowError (0,'[map]:[mapLayers]:[layer] (type = "dynamic"):[sublayers]:[sublayer]:[popup]:[fields]:[field]: Отсутствует обязательный параметр name.');
									exit;
								}
								
								field.label = item2.getAttribute("label");
								field.format = item2.getAttribute("dateFormat");
								field.visible = true;
								
								if (field.format != undefined)
								{
									field.format = {dateFormat : field.format};
								}
								else
								{
									field.format = item2.getAttribute("numericFormat");
									
									if (field.format != undefined)
									{
										field.format = field.format.split(',');
										
										try
										{	
											field.format = {places : parseInt (field.format[0]), digitalSeparator : field.format[1] == "true"};
										}
										catch (err)
										{
											field.format = undefined;
										}
									};
								};
									
								fields.push (field);
							})	

							popup.fields = fields;
						}
								
						var _charts           = _popup[0].getElementsByTagName("charts");		

						if (_charts[0] != undefined)
						{
							var _chart = _charts[0].getElementsByTagName("chart");
							var item2;
						
							popup.charts = [];
						
							dojo.forEach(_chart, function(item2)
							{
								var chart = new Object;
								chart.title = item2.getAttribute("title");
								chart.type = item2.getAttribute("type") == undefined ? 'Lines' : item2.getAttribute("type");
								chart.fields  = item2.getAttribute("fields");
								
								if (chart.fields == undefined)
								{
									ShowError (0,'[map]:[mapLayers]:[layer] (type = "dynamic"):[sublayers]:[sublayer]:[popup]:[charts]:[chart]: Отсутствует обязательный параметр fields.');
									exit;
								}
								else
								{
									chart.fields = chart.fields.split(",");
								}
											
								if (item2.getAttribute("labels") != undefined) 
								{
									chart.labels = item2.getAttribute("labels").split(",");
								}									
											
								popup.charts.push (chart);
							})	
						};
												
						var _images = _popup[0].getElementsByTagName("images");		

						if (_images[0] != undefined)
						{
							var _image  = _images[0].getElementsByTagName("image");
							var item2;
							popup.images = [];
										
							dojo.forEach(_item2, function(item2)
							{
								var image = new Object;
								image.title = item2.getAttribute("title");
								image.url = item2.getAttribute("url");
								image.field  = item2.getAttribute("field");
								
								if ((image.url == undefined) && (image.field == undefined))
								{
									ShowError (0,'[map]:[mapLayers]:[layer] (type = "dynamic"):[sublayers]:[sublayer]:[popup]:[images]:[image]: Одновременно отсутствуют параметры url и field.');
									exit;
								}
								
								popup.images.push (image);
							})	
						}

						sublayer.popup = popup;
						
					}
					
					var _edit = item1.getElementsByTagName("edit");
					
					if (_edit[0] != undefined)
					{
						var edit = new Object;
								
						edit.featureServiceUrl = _edit[0].getAttribute ("featureServiceUrl");
						
						if (edit.featureServiceUrl == undefined)
						{
							ShowError (0,'[map]:[mapLayers]:[layer] (type = "dynamic"):[sublayers]:[sublayer]:[edit]: Отсутствуют обязательный параметр featureServiceUrl.');
							exit;
						}
						
						var _fields = _edit[0].getElementsByTagName ("fields");
						
						if (_fields[0] != undefined)
						{
							var _field = _fields[0].getElementsByTagName ("field");							
							var fields = [];
							var item2;
						
							dojo.forEach(_field, function(item2)
							{
								var field = new Object;
								field.fieldName = item2.getAttribute("name");
								
								if (field.fieldName == undefined)
								{
									ShowError (0,'[map]:[mapLayers]:[layer] (type = "dynamic"):[sublayers]:[sublayer]:[edit]:[field]: Отсутствуют обязательный параметр name.');
									exit;
								}
								
								field.label = item2.getAttribute("label");
								fields.push (field);
							})	
						
							edit.fields = fields;
						}
						
						sublayer.edit = edit;						
					}
					
					sublayers.push (sublayer);
				});
						
				if (flIdentify)
				{
					map.identifyLayers.push (layer);
				}
					
				layer.sublayers = sublayers;
			}
		}
								
		if (layer.type == "feature")
		{
			layer.mode = item.getAttribute("mode") == undefined ? 'ONDEMAND' : item.getAttribute("mode");
			layer.outFields = item.getAttribute("outFields") == undefined ? ['*'] : item.getAttribute("outFields").split(",");
			layer.snapping = item.getAttribute ("snapping") == undefined ? true : item.getAttribute ("snapping") == "true";
			layer.definitionExpression = item.getAttribute("definitionExpression");
					
			var _tooltip = item.getElementsByTagName ("tooltip");
				
			if (_tooltip[0] != undefined)
			{
				var tooltip = new Object;		
				tooltip.title   = _tooltip[0].getAttribute("title");
				tooltip.content = _tooltip[0].getAttribute("content");
				
				if (tooltip.content == undefined)
				{
					ShowError (0,'[map]:[mapLayers]:[layer] (type = "feature"):[tooltip]: Отсутствуют обязательный параметр content.');
					exit;
				}
			
				tooltip.opacity = _tooltip[0].getAttribute("opacity");
				
				try
				{
					tooltip.opacity = parseFloat (tooltip.opacity);
				}
				catch (err)
				{
					tooltip.opacity = 1;
				}
				
				layer.tooltip   = tooltip;
			}
					
			var _popup = item.getElementsByTagName("popup");
			
			if (_popup[0] != undefined)
			{
				var popup = new Object;		
				popup.title    = _popup[0].getAttribute("title");
				popup.content  = _popup[0].getAttribute("content");
						
				var _fields  = _popup[0].getElementsByTagName("fields");

				if (_fields[0] != undefined)
				{
					var _field  = _fields[0].getElementsByTagName("field");					
					var item1;
					var fields = [];
					
					dojo.forEach(_field, function(item1)
					{
						var field = new Object;
						field.fieldName = item1.getAttribute("name");
								
						if (field.fieldName == undefined)
						{
							ShowError (0,'[map]:[mapLayers]:[layer] (type = "feature") :[popup]:[fields]:[field]: Отсутствует обязательный параметр name.');
							exit;
						}
								
						field.label = item1.getAttribute("label");
						field.format = item1.getAttribute("dateFormat");
						field.visible = true;
								
						if (field.format != undefined)
						{
							field.format = {dateFormat : field.format};
						}
						else
						{
							field.format = item1.getAttribute("numericFormat");
					
							if (field.format != undefined)
							{
								field.format = field.format.split(',');
										
								try
								{	
									field.format = {places : parseInt (field.format[0]), digitalSeparator : field.format[1] == "true"};
								}
								catch (err)
								{
									field.format = undefined;
								}
							};
						};
							
						fields.push (field);
					})
					
					popup.fields = fields;					
				}
						
				var _charts           = _popup[0].getElementsByTagName("charts");		

				if (_charts[0] != undefined)
				{
					var chart  = _charts[0].getElementsByTagName("chart");
					var item1;
					popup.charts = [];
					
					dojo.forEach(chart, function(item1)
					{
						var chart = new Object;
						chart.title = item1.getAttribute("title");
						chart.type = item1.getAttribute("type") == undefined ? 'Lines' : item1.getAttribute("type");
						chart.fields  = item1.getAttribute("fields");
								
						if (chart.fields == undefined)
						{
							ShowError (0,'[map]:[mapLayers]:[layer]:[popup]:[charts]:[chart]: Отсутствует обязательный параметр fields.');
							exit;
						}
						else
						{
							chart.fields = chart.fields.split(",");
						}
											
						if (item1.getAttribute("labels") != undefined) 
						{
							chart.labels = item1.getAttribute("labels").split(",");
						}									
											
						popup.charts.push (chart);
					})	
				};
						
				var _images           = _popup[0].getElementsByTagName("images");		

				if (_images[0] != undefined)
				{
					var _image  = _images[0].getElementsByTagName("image");
					var item1;
					popup.images = [];
										
					dojo.forEach(_image, function(item1)
					{
						var image = new Object;
						image.title = item1.getAttribute("title");
						image.url = item1.getAttribute("url");
						image.field  = item1.getAttribute("field");
								
						if ((image.url == undefined) && (image.field == undefined))
						{
							ShowError (0,'[map]:[mapLayers]:[layer] (type = "feature"):[popup]:[images]:[image]: Одновременно отсутствуют параметры url и field.');
							exit;
						}
				
						popup.images.push (image);
					})	
				};
						
				layer.popup = popup;
			}

			var _edit = item.getElementsByTagName("edit");
					
			if (_edit[0] != undefined)
			{
				var edit = new Object;
				var _fields = _edit[0].getElementsByTagName ("fields");
				
				if (_fields[0] != undefined)
				{
					var _field = _fields[0].getElementsByTagName ("field");
					var item1;
						
					var fields = [];
					
					dojo.forEach(_field, function(item1)
					{
						var field = new Object;
						field.fieldName = item1.getAttribute("name");
							
						if (field.fieldName == undefined)
						{
							ShowError (0,'[map]:[mapLayers]:[layer] (type = "feature"):[edit]:[fields]:[field]: Отсутствуют обязательный параметр name.');
							exit;
						}
							
						field.label = item1.getAttribute("label");
						fields.push (field);
					})	
						
					edit.fields = fields;
				}
				
				layer.edit = edit;									
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
		appId:      config.portal.appID,
		portal:     config.portal.url,
		expiration: config.portal.expiration,
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
		if ((config.portal.ssl) && (config.portal.url.indexOf ('https') < 0))
		{
			var urlhttps = config.portal.url.replace ("http", "https");
		}
		else
		{
			var urlhttps = config.portal.url;
		}

		new esriPortal.Portal(urlhttps).signIn().then(
			function(portalUser)
			{
				config.portal.user = portalUser.username;
				config.portal.portal = portalUser.portal;
				GetServiceUrls ();	
			}
        ).otherwise(
			function(error) 
			{
				ShowError (1, 'Ошибка при подключении к порталу.');
			}
        );
	});
}

function GetServiceUrls ()
{
	var q = '';
	
	for (var i = 0, counti = config.map.layers.length; i < counti; i++)
	{		
		if (((config.map.layers[i].url == null) || (config.map.layers[i].url == '')) && (config.map.layers[i].portalID != null) && (config.map.layers[i].portalID != ''))
		{
			if (i > 0)
			{
				q = q + ' OR ';
			}
			
			q = q + 'id:' + config.map.layers[i].portalID;
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
			if (config.map.layers[j].portalID == items.results[i].id)
			{
				config.map.layers[j].url = items.results[i].url;
				break;
			}
		}
	}

	
	LoadMap();
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
		dojo.style(dojo.byId("heading"), "font-family", config.design.heading.fontname);
		dojo.style(dojo.byId("heading"), "color", config.design.heading.fontcolor);
		dojo.style(dojo.byId("heading"), "background-color", config.design.heading.bgcolor);
		dojo.style(dojo.byId("heading"), "text-align", config.design.heading.textalign);
	}
	else if (config.design.heading.type == "image")
		{
			dojo.style(dojo.byId("heading"), "background", "url(" + config.design.heading.fillimage + ") repeat-x");
			dojo.style(dojo.byId("heading"), "background-position", "left top");
		
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
		if (config.map.options.wkid != undefined)
		{
			var extent = new esri.geometry.Extent (config.map.options.extent.xmin, config.map.options.extent.ymin, config.map.options.extent.xmax, config.map.options.extent.ymax, new esri.SpatialReference({ wkid: config.map.options.wkid}));
		}
		else
		{
			var extent = new esri.geometry.Extent (config.map.options.extent.xmin, config.map.options.extent.ymin, config.map.options.extent.xmax, config.map.options.extent.ymax);
		}
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
					
					}
										
					if (config.map.layers[i].sublayers[j].edit != null)
					{
						try
						{
							featureSubLayer = new esri.layers.FeatureLayer(config.map.layers[i].sublayers[j].edit.featureServiceUrl,{
								mode: esri.layers.FeatureLayer.MODE_SELECTION,
								outFields:["*"],
								definitionExpression : definitionExpressions[config.map.layers[i].sublayers[j].id]
							});
							
							featureSubLayer['parentLayer'] = layer;
							featureSubLayer['subLayerID']  = config.map.layers[i].sublayers[j].id;
							
							if (definitionExpressions[config.map.layers[i].sublayers[j].id] != undefined)
							{
								featureSubLayer.setDefinitionExpression (definitionExpressions[config.map.layers[i].sublayers[j].id]);
							}
							
							map.editableLayerCount = map.editableLayerCount + 1;
						}
						catch (err)
						{
						}
						
						dojo.connect (featureSubLayer, "onSelectionComplete", function (features,selectionMethod)
						{
							var subLayerID = parseInt (featureSubLayer.subLayerID);
							console.log (subLayerID);
							console.log (featureSubLayer.parentLayer.visibleLayers);
							
							if (featureSubLayer.parentLayer.visibleLayers.indexOf (subLayerID) >= 0)
							{
								if (features.length > 0)						
								{
									map.selectedLayers.push (features[0].getLayer());
								}	
							}
							else
							{
								featureSubLayer.clearSelection();
							};

							map.selectableLayerCount = map.selectableLayerCount + 1;
							
							if (map.selectableLayerCount == map.editableLayerCount)
							{
								editDialog.hide();
							}					
						})		
						
						featureSubLayer['edit'] = true;
						featureSubLayer['editFields'] = config.map.layers[i].sublayers[j].edit.fields;
						
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

			var layer = new esri.layers.FeatureLayer(url,{
				id : config.map.layers[i].id, 
				visible: config.map.layers[i].visible, 
				outFields: config.map.layers[i].outFields, 
				mode: mode,
				opacity : config.map.layers[i].opacity});	
				
			if (config.map.layers[i].definitionExpression != undefined)
			{
				layer.setDefinitionExpression (config.map.layers[i].definitionExpression);
			};
			
			if (config.map.layers[i].popup != null) 
			{
				dojo.connect(layer, "onClick", function (evt)
				{
					if (activeTool == 'identify')
					{
						map.infoWindow.clearFeatures();		
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
				layer ['editFields'] = config.map.layers[i].edit.fields;
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
	// prevent twice firing event on mobile devices
	if (evt.constructor.name == undefined)
	{
		return;
	};
	
	if (activeTool == 'edit')
	{		
		if ((map.selectedLayers.length > 0) || (editorWidget._layer != null) && (editorWidget._activeTemplate == null))
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
			
			if (editorWidget._activeTemplate == null)
			{
				editDialog.show();
			}
		}
	}
	
	if (activeTool == 'identify')
	{
		map.infoWindow.clearFeatures();			
		alert ('show');
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
					if (res[i][0] == true)
					{
						id	= config.map.identifyLayers[i].id;
						
						var layer = map.getLayer(id);
						
						if (layer.visible)
						{								
							for (var j = 0, countj = config.map.layers.length; j < countj; j ++)
							{
								if (id == config.map.layers[j].id)
								{
									for (var k = 0; k < res[i][1].length; k++)
									{
										var sublayerID = res[i][1][k].layerId;
										
										var sublayerVisible = false;
										
										for (var g = 0; g < layer.visibleLayers.length; g ++)
										{
											if (layer.visibleLayers[g] == sublayerID)
											{
												sublayerVisible = true;
												break;
											}
										}
										
										if (sublayerVisible)
										{								
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
									}
									
									break;
								}
							}
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
				dijit.byId('outerContainer').resize();
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
			ShowError (2, "Слой '" + results.layers[i].layer.title + "' не был добавлен на карту. Сервис не существует или недоступен."); 
		}
	}
	
	ApplyLoginFilter();
	LoadWidgets();
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
			var login = layer.credential.userId;
		}
		else if (config.portal != undefined)
			{
				var  login = config.portal.user;
			}
			
		if (login != undefined)
		{		
			if (layer.layerDefinitions != undefined)
			{
				for (j = 0; j < layer.layerDefinitions.length; j ++)
				{
					if ((layer.layerDefinitions[j] != undefined) && (layer.layerDefinitions[j].indexOf("$login") >= 0))
					{
						layer.layerDefinitions[j] = layer.layerDefinitions[j].replace ('$login', "'" + layer.credential.userId + "'");
					}
				}
				layer.setLayerDefinitions (layer.layerDefinitions);
			}
						
			if (layer.type == "Feature Layer")
			{
				var defExpr = layer.getDefinitionExpression();
				
				if ((defExpr != undefined) && (defExpr.indexOf('$login') >=0))
				{
					defExpr = defExpr.replace ('$login', "'" + layer.credential.userId + "'");
					layer.setDefinitionExpression (defExpr);
				}
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
			ShowError (1, "Ошибка создания виджета редактирования.");
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
			ShowError (1, "Ошибка создания виджета измерений по карте.");
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
			ShowError (1, "Ошибка создания виджета идентификации.");
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
			ShowError (1, "Ошибка создания виджета геокодирования.");
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
			ShowError (1, "Ошибка создания виджета прокладки маршрута.");
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
			ShowError (1, "Ошибка создания виджета печати.");
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
			ShowError (1, "Ошибка создания виджета выбора базовой карты.");
		}
	}
	else
	{
		dijit.byId ("propsContainer").removeChild (dijit.byId ("basemapPanel"));
	}
	
	if (config.widgets.toc != undefined)
	{
		try
		{
			AddTocWidget();
		}
		catch (err)
		{
			ShowError (1, "Ошибка создания виджета таблицы содержания.");
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
			ShowError (1, "Ошибка создания виджета закладок.");
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
			ShowError (1, "Ошибка создания виджета дополнительной информации.");
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
			ShowError (1, "Ошибка создания виджета фильтрации объектов по дате.");
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
			ShowError (1, "Ошибка создания виджета масштабной линейки.");
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
			ShowError (1, "Ошибка создания виджета обзорного окна карты.");
		}
	}	

	dojo.connect (dijit.byId ('toolsContainer'), 'selectChild', ToolsTabSelected);
	
	return 0;
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
		alphabet:["А" , "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х"],
		routeParams: {
			directionsLanguage: "ru-RU",
			returnRoutes: true
		},
		routeTaskUrl : routeTaskUrl,
		locatorUrl : locatorUrl,
		geocoderOptions: geocoderOptions,
		id : "routeDijit"
	}, 'route');
		
	routeDijit.startup();
	dojo.connect (routeDijit, "onDirectionsFinish", DirectionsFinish);
	routeDijit.on ('directions-clear', DirectionsClear);
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

function DirectionsClear ()
{
	map.routeLayer.clear();
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
					slider   : map.layers[i].tocSlider
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
				thumbnailUrl : config.map.basemaps[i].image
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
		if (config.widgets.bookmarks.bookmarks[i].extent.wkid == undefined)
		{
			var sr = map.spatialReference;
		}
		else
		{
			var sr = new esri.SpatialReference({ wkid: config.widgets.bookmarks.bookmarks[i].extent.wkid})
		}
		
		var extent = new esri.geometry.Extent (config.widgets.bookmarks.bookmarks[i].extent.xmin, 
		                                       config.widgets.bookmarks.bookmarks[i].extent.ymin, 
											   config.widgets.bookmarks.bookmarks[i].extent.xmax, 
											   config.widgets.bookmarks.bookmarks[i].extent.ymax, 
											   sr);
											   
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
					fieldInfos   : map.layers[i].editFields
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
		
			var createOptions = {polylineDrawTools:[], polygonDrawTools:[]};
		
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

			if ((editorWidget._layer != null) && (editorWidget._layer.type == "Feature Layer"))
			{
				editorWidget._layer.clearSelection();
			}
			
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
	map ['geocoderResultLayer'] = new esri.layers.GraphicsLayer({id : 'geocoderResults'});
	map.addLayer (map.geocoderResultLayer);
	dojo.connect (map.geocoderResultLayer, "onClick", geocoderResultLayerClick);
	
	map ['geocoderResultSymbol'] = //new esri.symbol.SimpleMarkerSymbol('solid', 20, null, new dojo.Color([255,0,0,1]));
	     new esri.symbol.SimpleMarkerSymbol(
            esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 
            12, 
            new esri.symbol.SimpleLineSymbol(
              esri.symbol.SimpleLineSymbol.STYLE_SOLID,
              new dojo.Color([210, 105, 30, 0.5]), 
              8
            ), 
            new dojo.Color([210, 105, 30, 0.9])
          );

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

	
	dojo.connect (geocoder, "onClear", GeocoderClear);
	geocoder.on ('select', GeocoderSelect);
	dojo.connect (geocoder, "onFindResults", GeocoderOnFindResults);
	geocoder.startup();
}

function GeocoderOnFindResults (results)
{
	geocoderDialog.hide();
	map.geocoderResultLayer.clear();
	
	if (results.results.length > 0)
	{
		results.results[0].feature.setSymbol (map.geocoderResultSymbol);
		results.results[0].feature.attributes ['name'] = results.results[0].name;
		map.geocoderResultLayer.add (results.results[0].feature);
		map.centerAt(results.results[0].feature);
	}	
}

function GeocoderClear ()
{
	map ['geocoderResultLayer'].clear();
	map.infoWindow.hide();
}

function GeocoderSelect (result)
{
	map.geocoderResultLayer.clear();
	result.result.feature.setSymbol (map.geocoderResultSymbol);
	result.result.feature.attributes ['name'] = result.result.name;
	map.geocoderResultLayer.add (result.result.feature);
	map.centerAt(result.result.feature);
}

function geocoderResultLayerClick (evt)
{
	map.infoWindow.resize (300, 100);
	map.infoWindow.setTitle  ("Информация о найденном объекте");
	map.infoWindow.setContent (evt.graphic.attributes.name);
	map.infoWindow.show (evt.mapPoint);	
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
		
		for (var i = 0; i < feature.charts.length; i ++)
		{
			var titleDiv = dojo.create ("div");
			titleDiv.innerHTML = "<hr><B>" + feature.charts[i].title + '</B></br></br>';
			var chartDiv = dojo.create ("div", {region : "center"});
			var legendDiv = dojo.create ("div", {region : "center"});
			var chart = new dojox.charting.Chart(chartDiv);
			chart.setTheme (dojox.charting.themes.Claro);
			dijit.byId ('identifyPanelMain').domNode.appendChild (titleDiv);
			dijit.byId ('identifyPanelMain').domNode.appendChild (chartDiv);
			dijit.byId ('identifyPanelMain').domNode.appendChild (legendDiv);
				
			chart.addPlot("default", {type: feature.charts[i].type, markers : true, labelOffset: -20});
								
			if (feature.charts[i].labels != [])
			{
				chart.addAxis("x", {labels : feature.charts[i].labels});
			};
				
			chart.addAxis("y", {vertical: true, min: 0});
				
			var tooltip = new dojox.charting.action2d.Tooltip(chart, "default");
				
			if ((feature.charts[i].type == "Markers") || (feature.charts[i].type == "MarkersOnly"))
			{
				var mag = new dojox.charting.action2d.Magnify(chart, "default");
			};
				
			
			if (feature.charts[i].type == "Columns")
			{
				var highlight = new dojox.charting.action2d.Highlight(chart, "default");
			};
				
			chart.addSeries("Series_" + i, feature.charts[i].series);				
			
			chart.render();
				
			if (feature.charts[i].type == "Pie")
			{
				var msl = new dojox.charting.action2d.MoveSlice(chart,"default");
				var legend = new dojox.charting.widget.Legend({ chart: chart }, legendDiv);
			}
		}
		
		for (var i = 0; i < feature.images.length; i ++)
		{
			var titleDiv = dojo.create ("div");
			titleDiv.innerHTML = "<hr><B>" + feature.images[i].title + '</B></br></br>';
			var img = document.createElement("img");
			img.setAttribute ("src", feature.images[i].url);
			dojo.style (img, "display", "block");
			dijit.byId ('identifyPanelMain').domNode.appendChild (titleDiv);
			dijit.byId ('identifyPanelMain').domNode.appendChild (img);			
		}
		
		dijit.byId ('identifyPanelMain').resize();
		dijit.byId ('tools').resize();
	}
}			

function BuildFeaturePopup (feature, popup)
{
	if ((popup.fields == undefined) || (popup.fields.length == 0))
	{
		var template = new esri.dijit.PopupTemplate({
			title: popup.title,
			description: popup.content
		});
	}
	else
	{
		var template = new esri.dijit.PopupTemplate({
			title: popup.title,
			fieldInfos: popup.fields
		});
	}
	
	feature['charts'] = [];
	
	if ( popup.charts != undefined)
	{		
		for (var m = 0; m < popup.charts.length; m ++)
		{
			var chart = new Object;
			chart.type  = popup.charts[m].type;
			chart.title = popup.charts[m].title;
			var labels = [];
			var series = [];
													
			for (f = 0; f < popup.charts[m].fields.length; f ++)
			{
				if (feature.attributes[popup.charts[m].fields[f]] != null)
				{
					series.push ({y: parseInt (feature.attributes[popup.charts[m].fields[f]]), legend : popup.charts[m].labels[f], tooltip : popup.charts[m].labels[f] + ' : ' + feature.attributes[popup.charts[m].fields[f]]});
												
					if (popup.charts[m].labels != undefined)
					{
						labels.push ({value: f + 1 , text : popup.charts[m].labels[f]});
					}
				}
				else
				{
					series.push ({y: 0, tooltip: "Нет данных"});
													
					if (popup.charts[m].labels != undefined)
					{
						labels.push ({value: f + 1, text : popup.charts[m].labels[f] + " (н/д)"});
					}
				}
			}		

			chart.series = series;
			chart.labels = labels;													
			feature.charts.push (chart);
		}
	};
	
	feature['images'] = [];
	
	if ( popup.images != undefined)
	{		
		for (var m = 0; m < popup.images.length; m ++)
		{
			var image = new Object;
			image.title = popup.images[m].title;
			
			if (popup.images[m].field != undefined) 
			{
				image.url = feature.attributes[popup.images[m].field];
			}
			else
			{
				image.url = popup.images[m].url;
			}
															
			feature.images.push (image);
		}
	};
	
	feature.setInfoTemplate(template);
}

function formatDate(date, datePattern) {
  return dojo.date.locale.format(date, {
    selector: 'date',
    datePattern: datePattern
  });
}
