# JavaScript Viewer for ArcGIS

Конфигурироемое веб-приложение, предназначенное для работы с ArcGIS for Server через REST-интерфейс. 

##Структура веб-приложения         
                
* index.html - головной файл веб-приложения
* proxy.ashx - прокси-страница веб-приложения
* proxy.config - конфигурационный файл прокси-страницы
* config.xml - конфигурационный файл веб-приложения
* config_help.txt - инструкция по настройке конфигурационного файла config.xml
* readme.txt - файл справки 
* main - папка, содержащая основные рабочие файлы веб-приложения
* css - папка с файлами css для настройки стилей карты и виджетов
* images - папка с изображениями, которые используются в приложении
 
##Настройка веб-приложения                       
	
Для настройки веб-приложения необходимо отредактировать файл config.xml. Инструкция по настройке находится в файле config_help.txt.

##Функциональность приложения                        
	
* Отображение базовых карт (c корпоративного ArcGIS for Server, карт ArcGIS Online, карт Google Maps), переключение базовых карт
* Отображение кэшированных, динамических и векторных слоев
* Cдвиг и масштабирование карты
* Список слоев и легенда, прозрачность слоев
* Фильтрация объектов по дате
* Авторизация при подключении к веб-сервисам (портальная авторизация OAuth 2, авторизация средствами ArcGIS for Server)
* Закладки
* Информация
* Идентификация объектов на карте, отображение информации об объектов (подсветка геометрии, значения полей, графики, диаграммы и изображения)
* Редактирование данных (векторные слои не перегружают память браузера)
* Измерения по карте
* Адресный поиск (геокодирование)
* Построение маршрутов
* Экспорт карты в PDF или PNG

##Работа приложения в сети Интернет и локальной сети 

Приложение может работать как при наличии Интернет-подключения, так и без него. 
При работе в локальной сети потребуется дополнительно скачивать и установить библиотеку [ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/jshelp/intro_accessapi.html).
При работе в локальной сети может потребоваться дополнительно скачать и установить библиотеку [agsjs](http://gmaps-utility-gis.googlecode.com/svn/tags/agsjs).

##Ссылки на веб-сервисы               
      
В файле config.xml можно указывать прямые ссылки на веб-сервисы ArcGIS for Server (параметр url). 
Для веб-сервисов, зарегистрированных в ArcGIS Online / Portal for ArcGIS можно указывать идентификаторы этих сервисов в ArcGIS Online / Portal for ArcGIS (параметр portalID). При использовании таких сервисов обязательно подключение секции <portal> в config.xml.

##Поддерживаемые браузеры 

Поддерживаются ровно те же браузеры, что и [браузеры, поддерживаемые ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/jshelp/supported_browsers.html).

##Лицензия
Copyright 2013 Esri CIS

Действует лицения [Apache License, версия 2.0] (http://www.apache.org/licenses/LICENSE-2.0). 

Если это не предусмотрено применимыми законами или не согласовано в письменной форме, программное обеспечение распространяется
«КАК ЕСТЬ», БЕЗ ГАРАНТИЙ И УСЛОВИЙ ЛЮБОГО РОДА, явных или подразумеваемых.

##Использование сторонних библиотек
Приложение использует дополнительные сторонние библиотеки:
* [ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/), [лицензионное соглашение](https://developers.arcgis.com/en/javascript/jshelp/terms.html)
* [gmaps-utility-gis](https://code.google.com/p/gmaps-utility-gis/), [лицензия Apache License, версия 2.0](http://www.apache.org/licenses/LICENSE-2.0)

##Использование сторонних ресурсовы
Приложение может использовать сторонние ресурсы:
* [Базовые карты ArcGIS Online](http://resources.arcgis.com/en/communities/arcgis-content/029700000044000000.htm#s=0&n=30&d=1&md=acomt-online:10000) ([соглашение об использовании](http://downloads2.esri.com/ArcGISOnline/docs/tou_summary.pdf))
* [Аналитические сервисы ArcGIS Online](http://resources.arcgis.com/en/communities/arcgis-content/029700000044000000.htm#s=0&n=30&d=1&md=acomt-online:00001) ([соглашение об использовании](http://downloads2.esri.com/ArcGISOnline/docs/tou_summary.pdf))
* [Карты Google Maps] (https://maps.google.com/) ([соглашение об использовании JavaScript API Google Карт] (https://developers.google.com/maps/documentation/javascript/usage?hl=ru))
* [Карта OpenStreetMap](http://www.openstreetmap.org/) ([соглашение об использовании](http://www.openstreetmap.org/copyright))
