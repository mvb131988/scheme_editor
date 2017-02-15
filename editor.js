

/****************************************************************************************************
 *  @project_name Graphical Editor of Symbolic Circuits.
 *	@author Minacov Vladimir
 *			e-mail: mvb13@mail.ru
 ***************************************************************************************************/


$(document).ready(function(){
	
	
	/************************************************************************************************
	 *  Класс управляет обработчиками(подключает/отключает) события click на всем документе.
	 ***********************************************************************************************/
	
	function constructDocumentClickController()
	{
		var doc_click_controller = {};
		
		
		/** Массив объектов вида{hname, hfunction, isBind} */
		var click_handlers = new Array();
		/** Идентификатор элемента с которым в данный момент связан (одновременно может быть связан 
		    только один элемент) обработчик глобального 'click'. */
		var bound_element_id = null;
		
		
		/**
		 *  Метод регистрирует новый обработчик.
 		 *  hname - имя обработчика,
		 *  hfunction - функция-обработчик.
		 */
		doc_click_controller.addHandler = function(hname, hfunction)
		{
			click_handlers.push({hname:hname, hfunction:hfunction, isBind:false});  
		}
		
		
		/**
		 *  Метод удаляет обработчик из списка зарегистрированных.
		 *  hname - имя обработчика.
		 */
		doc_click_controller.removeHandler = function(hname)
		{
			var hpos = doc_click_controller.getHandlerPositionByName(hname);
			if(hpos != -1)
			{
				click_handlers.splice(hpos,1);
			}
		}
		
		
		/**
		 *  Метод возвращает позицию элемента в массиве click_handlers.
		 *  hname - имя обработчика.  
		 */
		doc_click_controller.getHandlerPositionByName = function(hname)
		{
			if(click_handlers.length)
			{
				var i = 0;
				while(i<click_handlers.length)
				{
					if(click_handlers[i].hname == hname){
						return i;
					}
					i++;
				}
			}
			return -1;
		}
		
		
		/**
		 *  Проверяем является ли имя name идентификатором элемента defImgPath.
		 */
		doc_click_controller.isDefImgPathElement = function()
		{
			if(!bound_element_id){
				return false;
			}
			if(bound_element_id.substring(0,10) == 'defImgPath'){
			   return true;
			}
			return false;
		}
		
		
		/**
		 *  Метод привязывает обработчик с именем hname к событию(click) на документе.
		 *  hname - имя обработчика.
		 */
		doc_click_controller.bindHandler = function(hname)
		{
			doc_click_controller.isDefImgPathElement(hname);
			bound_element_id = hname;
			console.log('+ ' + hname);
			var handler = click_handlers[doc_click_controller.getHandlerPositionByName(hname)];
			if(!handler.isBind)
			{
				$(document).bind('click.' + handler.hname, handler.hfunction);
				handler.isBind = true;
			}
		}
		
		
		/**
		 *  Метод отсоединяет обработчик с именем hname события(click) на документе.
		 *  hname - имя обработчика.
		 */
		doc_click_controller.unbindHandler = function(hname)
		{
			bound_element_id = null;
			console.log('- ' + hname);
			/** Ситуация, когда для удаляемого элемента не был зарегистрирован обработчик. */
			if(doc_click_controller.getHandlerPositionByName(hname) != -1)
			{
				var handler = click_handlers[doc_click_controller.getHandlerPositionByName(hname)];
				if(handler.isBind)
				{
					$(document).unbind('click.' + handler.hname);
					handler.isBind = false;
				}
			}
		}
		
		
		/**
		 *  Метод отсоединяет все обработчики события(click) на документе.
		 */
		doc_click_controller.unbindAllHandlers = function()
		{
			for(var i=0; i<click_handlers.length; i++)
			{
				$(document).unbind('click.' + click_handlers[i].hname);
				click_handlers[i].isBind = false;
			}
		}
		
		
		/**
		 *  Метод проверяет зарегистрирован ли обработчик с именем hname события(click) на документе.
		 *  hname - имя обработчика.
		 */
		doc_click_controller.isRegistered = function(hname)
		{
			for(var i=0; i<click_handlers.length; i++)
			{
				if(hname == click_handlers[i].hname)
				{
					return true;
				}
			}
			return false;
		}
		
		
		/**
		 *  Переименование обработчиков событий.
		 *  old_hname - старое имя обработчика.
		 *  new_hname - новое имя обработчика.
		 */
		doc_click_controller.renameHandler = function(old_hname, new_hname)
		{
			for(var i=0; i<click_handlers.length; i++)
			{
				if(click_handlers[i].hname == old_hname){
					click_handlers[i].hname = new_hname;
					return;
				}
			}
		}
		
		
		return doc_click_controller;
	}
	
	/***************************** constructDocumentClickController *********************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Класс input-а для вывода доступных изображений элемента.
	 *  spec = {input - начальное поле ввода,
	 *			container - контейнер в котором находится input,
	 *			doc_click_controller - контроллер глобального 'click',
	 *			uid - идентификатор input-а}
	 ***********************************************************************************************/
	 
	function constructImgSelect(spec)
	{
		var img_select_input = {};
		
		
		/** Div контейнер для select элементов. */
		var select_container = null;
		/** Основной элемент. */
		var select = spec.input;
		/** Выпадающий элемент. */
		var img_gallery = null;
        /** Флаг видимости выпадающего элемента. */
        var isImgGalleryVisible = false;
		
		
		/**
		 *  Инициализация выпадающего элемента.
		 */
		img_select_input.loadImgGallery = function()
	    {
			var element_type = spec.uid.startsWith('link') ? spec.uid.substring(0,4) : spec.uid.substring(0,5);
			$.post('php/getImgList.php', {element_type: element_type}, function(data){
				var imgs_path = data.split('\n');
				var gallery_str = '<div id="img_gallery_plugin"><table border="1" width="100%">';
				for(var i=0; i<imgs_path.length-1; i++)
				{
					gallery_str += '<tr><td>' +
								   '<img src="' + imgs_path[i] + '" width="30px" height="30px" />' +
								   '</td></tr>';	
				}
				gallery_str += '</table></div>';
				img_gallery = $(gallery_str);
				img_select_input.setTdsMouseListeners(img_gallery.find('td'));
				img_gallery.css('position', 'relative')
						   .css('top', 0)
						   .css('left', 0);		   		   
			});
		}
		
		
		/**
		 *  Установка обработчиков событий mouseover, mouseout, click на контейнер изображения.
		 */
		img_select_input.setTdsMouseListeners = function(tds)
		{
			for(var i=0; i<tds.length; i++)
			{
				$(tds[i]).bind('mouseover', function(){
					$(this).css('background-color', '#CEE9F5');
				});
				$(tds[i]).bind('mouseout', function(){
					$(this).css('background-color', 'white');
				});
				$(tds[i]).bind('click', function(event){							   
					event.stopPropagation();
					select.val(($(this).find('img').attr('src')));
					img_gallery.detach();
					isImgGalleryVisible = false;
					select.focus();
					select.trigger('itemSelected', [$(this).find('img').attr('src')]);
				});		
			}
		}
		
			
		/**
		 *  Контроль видимости выпадающего элемента.
		 */
		img_select_input.controlDropDownElementVisibility = function(clicked_element_id)
		{
			if(clicked_element_id == select.attr('id'))
			{
				if(!isImgGalleryVisible)
				{
					select_container.append(img_gallery);
					isImgGalleryVisible = true;
					return;
				 }
			 }
			 if(img_gallery)
			 {
				img_gallery.detach();
				isImgGalleryVisible = false;
				select.focus();
				select.trigger('itemSelected', [$(this).find('img').attr('src')]);
				return;
			 }
		}
		
		
		/**
		 *  Проверка на каком элементе документа произошел 'click'.
		 */
		img_select_input.controlOutOfDropDownElementClick = function()
		{
			var click_handler = function(e){
			    var clicked_element = $(e.target).attr('id');
			    img_select_input.controlDropDownElementVisibility(clicked_element);
			};
			spec.doc_click_controller.addHandler('defImgPath_' + spec.uid, click_handler);
			//doc_click_controller.bindHandler('defImgPath_' + element_uid);
		}
		
		
		/**
		 *  Конструктор объекта img_select_input. 
		 */
		img_select_input.construct = function()
		{
			//constructImgSelect.controlOutOfDropDownElementClick(img_select_input, element_uid);
			select.detach();
			select_container = $('<div id="plugin_div_img_select">');
			select_container.append(select);
			spec.container.append(select_container);		
			img_select_input.loadImgGallery();	  
		}
		img_select_input.construct();
		
		
		return img_select_input;
	}
	
	/***************************** constructImgSelect ***********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор схемы.
	 *  spec = {title, img_path}, title - название схемы, img_path - путь к изображению на сервере.
	 ***********************************************************************************************/
	
	function constructScheme(spec)
	{
		var scheme = {};
		
		var img_scheme = $('#background_img');
		/** Инициализация для IE. */
		var width = img_scheme.width(); 
		var height = img_scheme.height();
		var left = img_scheme.offset().left;
		var top = img_scheme.offset().top;
		
		/** Название схемы. */
		var title = spec.scheme_name;
		/** Путь к изображению на сервере. */
		var img_path = spec.scheme_path;
		
		
		/** Инициализация для Firefox и Chrome. */
		img_scheme.load(function(){
			width = $(this).width();
			height = $(this).height();
			left = $(this).offset().left;
			top = $(this).offset().top;
		});
		
		
		/** Возврат размеров схемы. */
		scheme.getMargins = function()
		{
			return {
						left: left,
						top: top,
						right: left+width,
						bottom: top+height
				   };
		}
		
		
		/** Установка имени схемы. */
		scheme.setTitle = function(scheme_title)
		{
			title.scheme_title = scheme_title;
		}
		
		
		/** Возврат названия схемы. */
		scheme.getTitle = function()
		{
			return title;
		}
		
		
		/** Возврат пути к данному изображению на сервере. */
		scheme.getImgPath = function()
		{
			return img_path;
		}
		
		
		return scheme;
	}
	
	/********************************** constructScheme *********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элементов палитры.
	 *  spec = {elements_palette, element_type, scheme, doc_click_controller}, 
	 *								   elements_palette - div палитры инструментов, 
	 *								   element_type - тип создаваемого элемента, 
	 *								   scheme - объект отображение схемы,
	 *								   doc_click_controller - контроллер обработчиков события click
	 *								   						  на документе.	
	 ***********************************************************************************************/
	
	function constructPaletteElement(spec)
	{
		var palette_element = {};
		
		
		/** private properties */
		var img_palette_element = spec.elements_palette.find('#' + spec.element_type + '_img');
		var div_palette_element = spec.elements_palette.find('#' + spec.element_type + '_cell');
		var width = img_palette_element.width();
		var height = img_palette_element.height();
		img_palette_element.load(function(){
			width = $(this).width();
			height = $(this).height();
		});
		var elements_list = new Array();
		
		
		/**
		 *  Выделение id для созданного элемента. 
		 */
		palette_element.assignElementId = function()
		{
			return elements_list.length+1;
		}
		
		
		/**
		 *  Добавление нового элемента в elements_list.
		 */
		palette_element.addElement = function(element)
		{
			elements_list.push(element);
		}
		
		
		/**
		 *  Обновление id всех элементов. Выполняется после того, как 
		 *  один из элементов был удален. Все id перенумеровываются начиная с 1.
		 *  start_index - номер элемента массива с которого необходимо начать обновление id.
		 */
		palette_element.refreshElementsId = function(start_index)
		{
			for(var i=start_index; i<elements_list.length; i++)
			{
				spec.doc_click_controller.removeHandler(elements_list[i].getSimpleValue('uid'));
				//spec.doc_click_controller.removeHandler('defImgPath_' + elements_list[i].getSimpleValue('uid'));
				
				var old_hname = elements_list[i].getSimpleValue('uid');
				elements_list[i].setElementUid(i+1);
				spec.doc_click_controller.renameHandler('defImgPath_' + old_hname, 
														'defImgPath_' + elements_list[i].getSimpleValue('uid'));
				
				//spec.doc_click_controller.addHandler('defImgPath_' + elements_list[i].getSimpleValue('uid'));
			}
		}
		
		
		/**
		 *  Удаление элемента из списка элементов. После этого выполняется обновление
		 *  id оставшихся элементов.
		 *	index - индекс удаляемого из elements_list элемента.
		 */
		palette_element.deleteElement = function(index)
		{
			elements_list.splice(index, 1);
			palette_element.refreshElementsId(index);
		}
		
		
		/**
		 *  Возвращение div элемента к которому прикрепляются созданные элементы схемы.
		 */
		palette_element.getDivPaletteElement = function()
		{
			return div_palette_element;	
		}
		
		
		/**
		 *  Возвращение размеров элемента палитры.
		 */
		palette_element.getElementDimension = function()
		{
			return {'width': width, 'height': height};
		}
		
		
		/**
		 *  Возвращение координат элемента относительно левого верхнего угла документа.
		 */
		palette_element.getElementMargins = function()
		{
			return {'left': img_palette_element.offset().left, 'top': img_palette_element.offset().top};
		}
		
		
		/**
		 *  Возвращает массив элементов данного типа, размещенных на схеме.
		 */
		palette_element.getSchemeElements = function()
		{
			return elements_list;
		}
		
		
		/**
		 *  При наведении курсора мыши на элемент палитры создвется новый элемент схемы.
		 */
		img_palette_element.bind('click', function(event, ui){
			var element_id = palette_element.assignElementId();											
			var constructor_chooser = 
			{
				'ai001': function(){
					return constructAi001Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});
				},
				'di001': function(){
					return constructDi001Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});		
				},
				'di002': function(){
					return constructDi002Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});	
				},
				'di003': function(){
					return constructDi003Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});
				},
				'aq001': function(){
					return constructAq001Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});
				},
				'dq001': function(){
					return constructDq001Element({id: element_id,
												  scheme: spec.scheme,
												  palette_element: palette_element,
												  doc_click_controller: spec.doc_click_controller});
				},
				'link': function(){
					return constructLinkElement({id: element_id,
												 scheme: spec.scheme,
												 palette_element: palette_element,
												 doc_click_controller: spec.doc_click_controller});
				}
			};										
			
			elements_list.push(constructor_chooser[spec.element_type]());
		});
		
		
		return palette_element;
	}
	
	constructPaletteElement.ai001 = 'ai001';	
	constructPaletteElement.di001 = 'di001';
	constructPaletteElement.di002 = 'di002';
	constructPaletteElement.di003 = 'di003';
	constructPaletteElement.aq001 = 'aq001';
	constructPaletteElement.dq001 = 'dq001';
	constructPaletteElement.palette_link = 'link'; 
	
	/********************************** constructPaletteElement *************************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню абстрактного элемента. 
	 *  spec = {div_menu_properties, properties}, где 
	 *	div_menu_properties - контейнер к которому добавляется таблица меню,	
	 *	properties_names - объект из свойств элемента
	 ***********************************************************************************************/
	
	function constructElementMenu(element)
	{
		var element_menu = {};
		
		element_menu._table = $('<table width="100%" cellspacing="5" class="menu_properties">' +
								'</table>');
		element_menu._ui_elements = new Array();
		
		/** Флаг показывает выбран ли элемент меню для ввода. */
		element_menu._isSelected = false;
		/** Имя ui элемента, находящегося в фокусе. */
		element_menu._inFocusUiName = null;
		
		
		/**
		 *  Создание строки без ui элементов.
		 *  name - имя свойства
		 */
		element_menu.createNoUiElementsRow = function(name)
		{
			var row = $('<tr></tr>');
			var name_cell = $('<td class="property_name"></td>');
			name_cell.append(name);
			var value_cell = $('<td id="' + name + '" align="right"></td>');
			element_menu._ui_elements.push({name: name, type: constructElementMenu.NoUiElements, 
							  ui_element: value_cell});
			row.append(name_cell, value_cell);
			element_menu._table.append(row);
		}
		
		
		/**
		 *  Создание строки с input элементом.
		 *  name - имя свойства
		 */
		element_menu.createInputRow = function(name)
		{
			var row = $('<tr></tr>');
			var name_cell = $('<td class="property_name"></td>');
			name_cell.append(name);
			var value_cell = $('<td></td>');
			var input = $('<input class="property_input" id="' + name + '" />');
			
			element_menu.setElementFocusinHandler(input);
			input.bind('focusout', function(event,ui){
					var properties = element.getPropertiesInObject();
					properties[$(this).attr('id')].setter($(this).attr('id'), $(this).val());
					element_menu._inFocusUiName = null;				
			});
			element_menu.setKeyHandler(input);
			
			element_menu._ui_elements.push({name: name, type: constructElementMenu.InputElement, 
							  ui_element: input});
			
			value_cell.append(input);
			
			if(name == 'defImgPath')
			{
				var doc_click_controller = element.getDocumentClickController();
				
				var img_select_input = constructImgSelect({input: input, container: value_cell,
														   doc_click_controller: doc_click_controller,
														   uid: element.getSimpleValue('uid')});
				img_select_input.controlOutOfDropDownElementClick();
				//!!!input.imgSelect(value_cell, doc_click_controller, element.getSimpleValue('uid'));
				
				name_cell.attr('valign', 'top');
				input.bind('click', function(e, path){
					$(this).focus();
					if(doc_click_controller.isRegistered(element.getSimpleValue('uid')))
					{
						/** Отключение глобального обработчика click для input-a defImgPath. */
						doc_click_controller.unbindHandler(element.getSimpleValue('uid'));
					}
					if(doc_click_controller.isRegistered('defImgPath_' + element.getSimpleValue('uid')))
					{						 
						doc_click_controller.bindHandler('defImgPath_' + element.getSimpleValue('uid'));
					}
				});
				input.bind('itemSelected', function(e, path){
					doc_click_controller.unbindHandler('defImgPath_' + element.getSimpleValue('uid'));
					doc_click_controller.bindHandler(element.getSimpleValue('uid'));
					var properties = element.getPropertiesInObject();
					properties[$(this).attr('id')].setter($(this).attr('id'), path);
					element.setImgSrc(path);
				});
			}
			
			row.append(name_cell, value_cell);
			element_menu._table.append(row);
		}
		
		
		/**
		 *  Создание строки с radiogroup элементом.
		 *  name - имя свойства(zeroStatus или oneStatus)
		 */
		element_menu.createZeroOneStatusRow = function(name)
		{
			var row = $('<tr></tr>');
			var name_cell = $('<td class="property_name"></td>');
			name_cell.append(name);
			var value_cell = $('<td align="center"></td>');
			
			var norm_radio_button = $('<input type="radio" id = "' + name + '1" />');
			var warning_radio_button = $('<input type="radio" id = "' + name + '2" />');
			var alarm_radio_button = $('<input type="radio" id = "' + name + '3" />');
			
			/** Добавление обработчиков событий к radio кнопкам. */
			var status_radio_group = [norm_radio_button, warning_radio_button, alarm_radio_button];
			for(var i=0; i<status_radio_group.length; i++)
			{
				element_menu.setKeyHandler(status_radio_group[i]);
				element_menu.setRadioClickHandler(status_radio_group[i]);
				element_menu.setRadioFocusoutHandler(status_radio_group[i]);
			}
			element_menu.setRadioGroupCheckedHandler(status_radio_group);
		
			element_menu._ui_elements.push({name: name + '1', type: constructElementMenu.RadioElement, 
							  ui_element: norm_radio_button});
			element_menu._ui_elements.push({name: name + '2', type: constructElementMenu.RadioElement, 
							  ui_element: warning_radio_button});
			element_menu._ui_elements.push({name: name + '3', type: constructElementMenu.RadioElement, 
							  ui_element: alarm_radio_button});
			
			/** Добавление radio кнопок в таблицу. */
			var radio_buttons_table = $('<table width="100%"></table>');
			var radio_buttons_row = $('<tr></tr>');
			radio_buttons_table.append(radio_buttons_row);
			var norm_radio_cell = $('<td bgcolor="#FF9999" align="center"></td>')
			var warning_radio_cell = $('<td bgcolor="#EDF97B" align="center"></td>');
			var alarm_radio_cell = $('<td bgcolor="#B2B9F9" align="center"></td>');
			norm_radio_cell.append(norm_radio_button);
			warning_radio_cell.append(warning_radio_button);
			alarm_radio_cell.append(alarm_radio_button);
			radio_buttons_row.append(norm_radio_cell).append(warning_radio_cell).append(alarm_radio_cell);
			
			value_cell.append(radio_buttons_table);
			row.append(name_cell, value_cell);
			element_menu._table.append(row);
		}
		
		
		/**
		 *  Создание строки с двумя input-ами для установки/отображения режима применения 0 и 1. 
		 *	mode_table - таблица для установки/отображения значения свойства mode. 
		 *  mode1_name - id первого input-а.
		 *  mode2_name - id второго input-а.
		 */
		element_menu.createModeRow = function(mode_table, mode1_id, mode2_id, mode1_tittle, mode2_tittle)
		{
			element._element_menu._table.append('<tr><td>mode</td><td id="mode_value"></td></tr>');
			element._element_menu._table.find('#mode_value').append(mode_table);
			
			var mode1 = element._element_menu._table.find('#' + mode1_id);
			var mode2 = element._element_menu._table.find('#' + mode2_id);
			
			/** Установка обработчиков событий на input элементы. */
			element._element_menu.setKeyHandler(mode1);
			element._element_menu.setKeyHandler(mode2);
			element._element_menu.setElementFocusinHandler(mode1);
			element._element_menu.setElementFocusinHandler(mode2);
			element._element_menu.setFocusoutModeHandler(mode1, mode2, mode1_tittle, mode2_tittle);
			element._element_menu.setFocusoutModeHandler(mode2, mode1, mode2_tittle, mode1_tittle);
			
			element._element_menu._ui_elements.push({name: mode1_id, type: constructElementMenu.InputElement, 
							  						 ui_element: mode1});
			element._element_menu._ui_elements.push({name: mode2_id, type: constructElementMenu.InputElement, 
							  						ui_element: mode2});
		}
		
		
		/**
		 *	Установка обработчика нажатия клавиш на элемент input_element.
		 */
		element_menu.setKeyHandler = function(input_element)
		{
			/** Зацикливание фокуса на элементах меню при нажатии Tab. */
			input_element.bind('keydown', function(event,ui){
				var key = event.which;
				/** Если нажат Tab */
				if (key == 9)
				{
					if(element_menu.isLastFocusableElement($(this)))
					{
						event.preventDefault();
						element_menu.setFocusOnFirstFocusableElement();
					}
					else
					{
						event.preventDefault();
						/** Порядковый номер input_element в ui_elements. */
						var i = 0;
						while(element_menu._ui_elements[i].name != $(this).attr('id'))
						{
							i++;
						}
						/** i - порядковый номер первого NoUi элемента . */
						while(element_menu._ui_elements[++i].type == constructElementMenu.NoUiElements)
						{
							i++;
						}
						element_menu._ui_elements[i].ui_element.focus();
					}
					/** Установка tooltip-а. */
					element.getImgElement().trigger('changeTooltip');
					/** Изменение положения графического элемента. */
					element.getImgElement().trigger('changePosition');
				}
			});
		}
		
		
		/**
		 *	Установка обработчика получения фокуса для элемента меню input_element.
		 */
		element_menu.setElementFocusinHandler = function(input_element)
		{
			input_element.bind('focusin', function(event,ui){
					if(!element_menu._isSelected){
						element_menu._isSelected = true;
					}
					element_menu._inFocusUiName = $(this).attr('id');
			});
		}
		
		
		/**
		 *	Установка обработчика получения фокуса на элемент input_element
		 *	(только для radio кнопок).
		 */
		element_menu.setRadioClickHandler = function(input_element)
		{
			input_element.bind('click', function(event,ui){
					if(!element_menu._isSelected){
						element_menu._isSelected = true;
					}
					element_menu._inFocusUiName = $(this).attr('id');
					$(this).focus();
			});
		}
		
		
		/**
		 *  Установка обработчика события focusout на radio кнопку. 
		 *  radio - radio кнопка на которую вешается обработчик. 
		 */
		element_menu.setRadioFocusoutHandler = function(radio)
		{
			radio.bind('focusout', function(event,ui){
				element_menu._inFocusUiName = null;
			});
		}
		
		
		/**
		 *  radio_group - массив radio кнопок.
		 */
		element_menu.setRadioGroupCheckedHandler = function(radio_group)
		{
			for(var i=0; i<radio_group.length; i++)
			{
				(function(i){
					radio_group[i].bind('change', function(event,ui){
						/** Одновременно выбранным может быть только одна radio кнопка.*/
						for(var j=0; j<radio_group.length; j++)
						{
							if(j!=i)
							{
								radio_group[j].prop('checked', false);
							}
						}
						/** Сохранение значения, если radio кнопка перешла 
						в состояние checked.*/
						if($(this).prop('checked'))
						{
							var properties = element.getPropertiesInObject();
							var name = $(this).attr('id').slice(0, $(this).attr('id').length-1);
							var value = null;
							/** Определение порядкового номера отмеченного radio кнопки.*/
							var checked_radio_number = $(this).attr('id').slice($(this).attr('id').length-1);
							
							/** Определение значения status параметра на основании порядкового номера отмеченной
							radio кнопки. */
							if(checked_radio_number){
								var value_chooser = {
									1: function(){return 'alarm';},
									2: function(){return 'warning';},
									3: function(){return 'norm';}
								};
								value = value_chooser[checked_radio_number]();
							}
							
							properties[name].setter(name, value);
						}
					});
				}(i));
			}
		}
		
		
		/**
		 *  Установка обработчика события focusout на mode1 элемент.
		 *  mode1 - input на который устанавливается обработчик.
		 *  mode2 - input значение которого изменяется обработчиком mode1.
		 *	mode1_tittle - название первого режима(пример: 1g или 0g). 
		 *	mode1_tittle - название второго режима.
		 */
		element_menu.setFocusoutModeHandler = function(mode1, mode2, mode1_tittle, mode2_tittle)
		{
			mode1.bind('focusout', function(event,ui){
				var name = $(this).attr('id');
				var value = $(this).val();
				if(value == '0')
				{
					mode2.val(1);
					if(name == mode1.attr('id')){
						value = mode1_tittle;
					}
					if(name == mode2.attr('id')){
						value = mode2_tittle;
					}
				}
				else if(value == '1')
				{
					mode2.val(0);
					if(name == mode1.attr('id')){
						value = mode2_tittle;
					}
					if(name == mode2.attr('id')){
						value = mode1_tittle;
					}
				}
				else
				{
					$(this).val('');
					mode2.val('');
					value = null;
				}
				var properties = element.getPropertiesInObject();
				properties['mode'].setter('mode', value);
				element._element_menu._inFocusUiName = null;
			});
		}
		
		
		/**
		 *  Проверка является ли текущий элемент последним(после потери им фокуса фокус 
		 * 	перейдет на элемент вне меню) элементом меню способным работать с фокусом.
		 *  current_element - элемент меню(объект JQuery) теряющий фокус.
		 */
		element_menu.isLastFocusableElement = function(current_element)
		{
			var is_last = false;
			for(var i=element_menu._ui_elements.length-1; i>-1; i--)
			{
				if (element_menu._ui_elements[i].type != constructElementMenu.NoUiElements)
				{
					if(element_menu._ui_elements[i].name == current_element.attr('id'))
					{
						is_last = true;
					}
					break;
				}
			}
			return is_last;
		}
		
		
		/**
		 *  Установка фокуса на первый элемент меню, способный работать с фокусом.
		 */
		element_menu.setFocusOnFirstFocusableElement = function()
		{
			for(var i=0; i<element_menu._ui_elements.length; i++)
			{
				if (element_menu._ui_elements[i].type != constructElementMenu.NoUiElements)
				{
					element_menu._ui_elements[i].ui_element.focus();
					break;
				}
			}
		}
		
		
		/**
		 *  Возвращает флаг, показывающий выбрано ли меню.
		 */
		element_menu.isMenuSelected = function()
		{
			return element_menu._isSelected;	
		}
		
		
		/**
		 *  Определяет должно ли меню оставаться видимым или его необходимо 
		 *	скрыть(на момент вызова метода).
		 *  Возврат true если меню остается видимым и false иначе.
		 */
		element_menu.controlMenuVisibility = function()
		{
			if(element_menu.isMenuSelected())
			{
				if(!element_menu.getInFocusUiName())
				{
					element_menu.hide();
					return false;
				}
			}	
			return true;
		}
		
		
		/**
		 *  Возвращает имя элемента обладающего фокусом.
		 */
		element_menu.getInFocusUiName = function()
		{
			return element_menu._inFocusUiName;	
		}
		
		
		/**
		 *  Установка текущих значений элемента.
		 *  properties - объект свойств для которых нет ui элементов.
		 */
		element_menu.setNoUiParameters = function(properties)
		{
			for(var prop_name in properties)
			{
				for(var i=0; i<element_menu._ui_elements.length; i++)
				{
					if(element_menu._ui_elements[i].name == prop_name)
					{
						element_menu._ui_elements[i].ui_element.html(properties[prop_name]);
					}
				}
			}
		}
		
		
		/**
		 *  Установка значения input элемента.
		 *  name - имя input элемента.
		 *  value - значение input элемента.
		 */
		element_menu.setInputValue = function(name, value)
		{
			for(var i=0; i<element_menu._ui_elements.length; i++)
			{
				if(element_menu._ui_elements[i].name == name)
				{
					element_menu._ui_elements[i].ui_element.val(value);
				}
			}
		}
		
		
		/**
		 *  Установка значения input элемента.
		 *  name - имя параметра RadioButton('zeroStatus', 'oneStatus').
		 *  value - значение параметра RadioButton.
		 */
		element_menu.setZeroOneStatusParameter = function(name, value)
		{
			var radio_button_selector = {
				alarm: '1',
				warning: '2',
				norm: '3'
			};
			for(var i=0; i<element_menu._ui_elements.length; i++)
			{
				if(element_menu._ui_elements[i].name == name+radio_button_selector[value])
				{
					element_menu._ui_elements[i].ui_element.prop('checked', true);
				}
			}
		}
		
		
		/**
		 *  Установка значения input элемента.
		 *  uid - идентификатор элемента.
		 *  value - значение параметра Mode.
		 */
		element_menu.setModeParameter = function(uid, value)
		{
			var element_type = uid.substr(0,5);
			var mode1_value = -1, mode2_value = -1;
			var mode1_input = null, mode2_input = null;
			
			var element_type_selector ={
				di001: function()
					   {
					   	  if(value == '0g'){
						  	mode1_input.val('1');
							mode2_input.val('0');
						  }
						  if(value == '1g'){
						  	mode1_input.val('0');
							mode2_input.val('1');
						  }
					   },
				di002: function()
					   {
					   	  if(value == '0on'){
						  	mode1_input.val('0');
							mode2_input.val('1');
						  }
						  if(value == '1on'){
						  	mode1_input.val('1');
							mode2_input.val('0');
						  }
					   },
				di003: function()
					   {
					   	  if(value == '0g'){
						  	mode1_input.val('0');
							mode2_input.val('1');
						  }
						  if(value == '1g'){
						  	mode1_input.val('1');
							mode2_input.val('0');
						  }
					   },
				dq001: function()
					   {
					   	  element_type_selector['di001']();
					   }
			};
			
			for(var i=0; i<element_menu._ui_elements.length; i++)
			{
				if(element_menu._ui_elements[i].name == uid+'_mode1')
				{
					mode1_input = element_menu._ui_elements[i].ui_element;
				}
				if(element_menu._ui_elements[i].name == uid+'_mode2')
				{
					mode2_input = element_menu._ui_elements[i].ui_element;
				}
			}
			
			element_type_selector[element_type]();
		}
		
		
		/**
		 *  Спрятать меню элемента.
		 */
		element_menu.hide = function()
		{
			element_menu._isSelected = false;
			element_menu._table.detach();
			element.setElementUnselectable();
			
			/** Обновление tooltip-а. */
			element.getImgElement().trigger('changeTooltip');
			/** Изменение позиции графического элемента. */
			element.getImgElement().trigger('changePosition');
		}
		
		
		/**
		 *  Отображение меню элемента. 
		 */
		element_menu.show = function()
		{
			$('#element_properties').append(element_menu._table);	
		}
	
		
		var properties = element.getPropertiesInObject();
		/** Инициализация элементов меню. */
		for(var prop_name in properties)
		{
			var type_chooser = {
				'0': element_menu.createNoUiElementsRow,
				'1': element_menu.createInputRow
			};
			type_chooser[properties[prop_name].type](prop_name);	
		}
	
	
		return element_menu;
	}
	
	
	/** Типы элементов меню для ввода и вывода значений параметров. */
	/** Элемент только для вывода значений параметров. */
	constructElementMenu.NoUiElements = 0;
	/** Элемент использующий input для ввода/вывода значений параметров.*/
	constructElementMenu.InputElement = 1;
	/** Элемент использующий radiobutton для ввода/вывода значений параметров.*/
	constructElementMenu.RadioElement = 2;
	
	
	/**
	 *  Определяет должно ли меню оставаться видимым или его необходимо 
	 *	скрыть(на момент вызова метода) при нажатии кнопки мыши на документе.
	 *  doc_click_controller - объект управляет обработчиками события click на документе.
	 */
	constructElementMenu.controlOnClickMenuVisibility = function(element_uid, element_menu, doc_click_controller)
	{
		var first_click = true;
		var element_handler = function(event,ui){
			if(!first_click)
			{
				if(!element_menu.controlMenuVisibility())
				{
					doc_click_controller.unbindHandler(element_uid);
				}
			}else{
				first_click = false;
			}
		};
		if(!doc_click_controller.isRegistered(element_uid))
		{
			doc_click_controller.addHandler(element_uid, element_handler);
		}
		doc_click_controller.bindHandler(element_uid);
	}
	
	
	/********************************** constructElementMenu ****************************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню для элемента Ai001Element. 
	 ***********************************************************************************************/
	
	function constructAi001ElementMenu(element)
	{	
		element._element_menu.createInputRow('color');
		for(prop in element.getSimpleValue('operatingRanges'))
		{
			element._element_menu.createInputRow(prop);
		}
		element._element_menu.createInputRow('precision');
		element._element_menu.createInputRow('unit');
		return element._element_menu;
	}
	
	
	/********************************** constructAi001ElementMenu ***********************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню для элемента Di001ElementMenu. 
	 ***********************************************************************************************/
	
	function constructDi001ElementMenu(element)
	{
		element._element_menu.createZeroOneStatusRow('zeroStatus');
		element._element_menu.createZeroOneStatusRow('oneStatus');
		
		var mode1_id = element._element_properties[1].uid + '_mode1';
		var mode2_id = element._element_properties[1].uid + '_mode2';
		var mode_table = '<table width="100%"><tr><td bgcolor="red" align="center">' + 
						 '<input id="' + mode1_id + '" class="mode"/></td>' +
						 '<td bgcolor="green" align="center">' +
						 '<input id="' + mode2_id + '" class="mode"/></td></tr></table>';
		element._element_menu.createModeRow(mode_table, mode1_id, mode2_id, '1g', '0g');
		
		return element._element_menu;
	}
	
	
	/********************************** constructDi001ElementMenu ***********************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор меню для элемента Di002ElementMenu. 
	 ***********************************************************************************************/
	
	function constructDi002ElementMenu(element)
	{
		var mode1_id = element._element_properties[1].uid + '_mode1';
		var mode2_id = element._element_properties[1].uid + '_mode2';
		var mode_table = '<table><tr><td align="right">' + 
						 '<img src="palette/pump_on.gif" /></td>'+
						 '<td><input id="' + mode1_id + '" class="mode"/></td></tr>' +
						 '<tr><td align="right"><img src="palette/pump_off.gif" /></td>' +
						 '<td align="left">' +
						 '<input id="' + mode2_id + '" class="mode"/></td>' +
						 '</tr></table>';
		element._element_menu.createModeRow(mode_table, mode1_id, mode2_id, '0on', '1on');
		
		return element._element_menu;
	}
	
	
	/********************************** constructDi002ElementMenu ***********************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор меню для элемента Di003ElementMenu. 
	 ***********************************************************************************************/
	
	function constructDi003ElementMenu(element)
	{
		var mode1_id = element._element_properties[1].uid + '_mode1';
		var mode2_id = element._element_properties[1].uid + '_mode2';
		var mode_table = '<table><tr><td align="right">' + 
						 '<img src="palette/di003_left.gif" /></td>'+
						 '<td><input id="' + mode1_id + '" class="mode"/></td></tr>' +
						 '<tr><td align="right"><img src="palette/di003_right.gif" /></td>' +
						 '<td align="left">' +
						 '<input id="' + mode2_id + '" class="mode"/></td>' +
						 '</tr></table>';
		
		element._element_menu.createZeroOneStatusRow('zeroStatus');
		element._element_menu.createZeroOneStatusRow('oneStatus');
		element._element_menu.createModeRow(mode_table, mode1_id, mode2_id, '0g', '1g');
		
		return element._element_menu;
	}
	
	
	/********************************** constructDi003ElementMenu ***********************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню для элемента Aq001ElementMenu. 
	 ***********************************************************************************************/
	
	function constructAq001ElementMenu(element)
	{	
		element._element_menu.createInputRow('color');
		for(prop in element.getSimpleValue('operatingRanges'))
		{
			element._element_menu.createInputRow(prop);
		}
		element._element_menu.createInputRow('precision');
		element._element_menu.createInputRow('unit');
		return element._element_menu;
	}
	
	
	/********************************** constructAq001ElementMenu ***********************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню для элемента Dq001ElementMenu. 
	 ***********************************************************************************************/
	
	function constructDq001ElementMenu(element)
	{	
		element._element_menu.createZeroOneStatusRow('zeroStatus');
		element._element_menu.createZeroOneStatusRow('oneStatus');
		
		var mode1_id = element.getSimpleValue('uid') + '_mode1';
		var mode2_id = element.getSimpleValue('uid') + '_mode2';
		var mode_table = '<table width="100%"><tr><td bgcolor="red" align="center">' + 
						 '<input id="' + mode1_id + '" class="mode"/></td>' +
						 '<td bgcolor="green" align="center">' +
						 '<input id="' + mode2_id + '" class="mode"/></td></tr></table>';
		element._element_menu.createModeRow(mode_table, mode1_id, mode2_id, '1g', '0g');
		
		return element._element_menu;
	}
	
	
	/********************************** constructDq001ElementMenu ***********************************
	************************************************************************************************/
	
	
	/***********************************************************************************************
	 *	Конструктор меню для элемента LinkElementMenu. 
	 ***********************************************************************************************/
	
	function constructLinkElementMenu(element)
	{	
		element._element_menu.createInputRow('color');
		element._element_menu.createInputRow('name');
        element._element_menu.createInputRow('href');
        element._element_menu.createInputRow('target');
		return element._element_menu;
	}
	
	
	/********************************** constructDq001ElementMenu ***********************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор абстрактного элемента. Содержит общие для всех типов элементов свойства и
	 *	методы.
	 *  spec = {id, scheme, palette_element, doc_click_controller}, 
	 *								где id - id элемента,  
	 *									scheme - объект отображение схемы,
	 *									palette_element - элемент палитры(управляет id элементов схемы)
	 *                                  doc_click_controller - контроллер обработчиков события click
	 *								   						   на документе.	
	 ***********************************************************************************************/
	
	function constructElement(spec)
	{
		var element = {};
		
		
		element._element_properties = 
		[
			{paramType: null},
			{uid: null},
			{paramName: null},
			{textName: null},
			{description: null},
			{top: null},
			{left: null},
			{defImgPath: null}
		];
		
		element._img_element = $('<img />');
		element._img_element.css('z-index','2').css('position', 'absolute')
								 			   .css('left', 0)
								  			   .css('top', 0)
								  			   .attr('tabindex', 0)
											   .attr('title', 'none');
		element._img_element.draggable();
		spec.palette_element.getDivPaletteElement().append(element._img_element);
		
		/** Флаг показывает выбран ли данный элемент схемы. */
		element._isSelected = false;
		
		
		/**
		 *  Возвращает объект, управляющий обработчиками события click на документе .
		 */
		element.getDocumentClickController = function()
		{
			return spec.doc_click_controller; 
		}
		
		
		/**
		 *  Проверка находится ли элемент полностью на схеме.
		 *  element_dimension - размеры изображения элемента.
		 */
		element.isCompletelyOnScheme = function(element_dimension)
		{
			var scheme_margins = spec.scheme.getMargins();
			//var element_dimension = spec.palette_element.getElementDimension();
			if(element.getSimpleValue('left')>scheme_margins.left && 
			   element.getSimpleValue('top')>scheme_margins.top &&
			   element.getSimpleValue('left')+element_dimension.width<scheme_margins.right && 
			   element.getSimpleValue('top')+element_dimension.height<scheme_margins.bottom)
			{
				return true;
			}else{
				return false;
			}
		}
		
		
		/**
		 *  Проверка находится ли элемент полностью вне схемы.
		 *  element_dimension - размеры изображения элемента.
		 */
		element.isCompletelyNotOnScheme = function(element_dimension)
		{
			 var scheme_margins = spec.scheme.getMargins();
			 //var element_dimension = spec.palette_element.getElementDimension();
			 if(element.getSimpleValue('left')+element_dimension.width<scheme_margins.left || 
				element.getSimpleValue('left')>scheme_margins.right ||
				element.getSimpleValue('top')>scheme_margins.bottom || 
				element.getSimpleValue('top')+element_dimension.height<scheme_margins.top)
			 {
				return true;
			 }
			 else{
				return false;
			 }
		}
		
		
		/**
		 *  Выравнивание элемента по границе схемы.
		 *  element_dimension - размеры изображения элемента.
		 */
		element.alignToScheme = function(element_dimension)
		{
			var scheme_margins = spec.scheme.getMargins();
			//var element_dimension = spec.palette_element.getElementDimension();
			var aligned_left = element.getSimpleValue('left');
			var aligned_top = element.getSimpleValue('top');
			if(aligned_left<scheme_margins.left){ 
				aligned_left = scheme_margins.left;
			}
			if(aligned_top<scheme_margins.top){ 
				aligned_top = scheme_margins.top;
			}
			if(aligned_left+element_dimension.width>scheme_margins.right)
			{
				aligned_left -=  aligned_left+element_dimension.width - scheme_margins.right;
			}
			if(aligned_top+element_dimension.height>scheme_margins.bottom)
			{
				aligned_top -=  aligned_top+element_dimension.height - scheme_margins.bottom;
			}
			element._img_element.offset({top: aligned_top, left: aligned_left});
		}
		
		
		/**
		 *  Удаление элемента со схемы и из списка элементов.
		 */
		element.removeElement = function()
		{
			/** Удаление обработчика глобального события click. */
			spec.doc_click_controller.unbindHandler('defImgPath_' + element.getSimpleValue('uid'));
			spec.doc_click_controller.removeHandler('defImgPath_' + element.getSimpleValue('uid'));
			spec.doc_click_controller.unbindHandler(element.getSimpleValue('uid'));
			spec.doc_click_controller.removeHandler(element.getSimpleValue('uid'));
			
			element._img_element.remove();
			/** Индекс элемента в palette_element.elements_list. */
			var index_in_elements_list = parseInt(element.getSimpleValue('uid')
												  .slice(element.getSimpleValue('paramType').length)) - 1;
			spec.palette_element.deleteElement(index_in_elements_list);
		}
		
		
		/**
		 *  Установка параметра uid.
		 *  index_in_elements_list - индекс элемента в palette_element.elements_list.
		 */
		element.setElementUid = function(index_in_elements_list)
		{
			element.setSimpleValue('uid', 
					 element.getSimpleValue('paramType') + index_in_elements_list.toString());
		}
		
		
		/**
		 *  Переводит объект в состояние выбрано. Это означает, что отображается меню,
		 *  связанное с данным элементом и элемент выделяется границей определенного цвета.
		 */
		element.setElementSelectable = function()
		{
			element._isSelected = true;
			element._img_element.css('border','1px solid #F80B0F');
		}
		
		
		/**
		 *  Переводит объект в состояние невыбрано. Это означает, что не отображается меню,
		 *  связанное с данным элементом и элемент не выделяется границей определенного цвета.
		 */
		element.setElementUnselectable = function()
		{
			element._isSelected = false;
			element._img_element.css('border','0px');
		}
		
		
		/**
		 *  Установка значения для заданного свойства.
		 *  name - имя параметра.
		 *  value - значение параметра.
		 */
		element.setSimpleValue = function(name, value)
		{
			for(var i=0; i<element._element_properties.length; i++)
			{
				if(name in element._element_properties[i])
				{
					element._element_properties[i][name] = value;
					break;
				}
			}
		}
		
		
		/**
		 *  Возвращение значения параметра, определяющего допустимые пределы.
		 *  name - имя параметра.
		 */
		element.getOperatingRangesValue = function(name)
		{
			for(var i=0; i<element._element_properties.length; i++)
			{
				if('operatingRanges' in element._element_properties[i])
				{
					var operating_ranges = element._element_properties[i]['operatingRanges'];
					return operating_ranges[name];
				}
			}
		}
		
		
		/**
		 *  Возвращение значения флага, показывающего используется ли соответстыующий ему 
		 *  допустимый предел.
		 *  name - имя флага.
		 */
		element.getOperatingRangesFlag = function(name)
		{
			for(var i=0; i<element._element_properties.length; i++)
			{
				if('operatingRangesFlags' in element._element_properties[i])
				{
					var operating_ranges_flags = element._element_properties[i]['operatingRangesFlags'];
					// для operating_ranges_flags
					//return operating_ranges[name.slice(0,5)];	
					return operating_ranges_flags[name];
				}
			}
		}
		
		
		/**
		 *  Установка значений параметров operatingRanges и operatingRangesFlags.
		 *  name - имя параметра.
		 *  value - значение параметра.
		 */
		element.setOperatingRangesValue = function(name, value)
		{
			for(var i=0; i<element._element_properties.length; i++)
			{
				if('operatingRanges' in element._element_properties[i])
				{	
					var operating_ranges = element._element_properties[i]['operatingRanges'];
					var operating_ranges_flags = element._element_properties[i-1]['operatingRangesFlags'];
					operating_ranges[name] = value;
					if(value){
						operating_ranges_flags[name.slice(0,5)] = true;
					}else{
						operating_ranges_flags[name.slice(0,5)] = false;
						operating_ranges[name] = null;
					}
				}
			}
		}
		
		
		/**
		 *  Возвращение значения свойства.
		 *  name - имя свойства.
		 *  value - значение свойства.
		 */
		element.getSimpleValue = function(name)
		{
			for(var i=0; i<element._element_properties.length; i++)
			{
				for(var prop in element._element_properties[i])
				{
					if(name == prop)
					{
						return element._element_properties[i][name];
					}
				}
			}
		}
		
		
		/**
		 *  Перемещение элемента на схеме.
		 */
		element.setImgElementPosition = function(left, top)
		{
			element._img_element.css('position','absolute').css('left', left)
														   .css('top', top);
		}
		
		
		/**
		 *  Установка пути к изображению.
		 *  img_src - путь к изображению
		 */
		element.setImgSrc = function(img_src)
		{
			element._img_element.attr('src', img_src);
		}
		
		
		/**
		 *  Установка значения свойства.
		 *  name - имя свойства.
		 *  value - значение свойства.
		 */
		/*element.setSimplePropertyValue = function(name, value)
		{
			/** Флаг true, когда свойство с именем name найдено. */
			/*var isFind = false;
			for(var i=0; i<element._element_properties.length; i++)
			{
				for(var prop in element._element_properties[i])
				{
					if(name == prop)
					{
						element._element_properties[i][name] = value;
						isFind = true;
					}
				}
				if(isFind){break;}
			}
		}*/
		
		
		/**
		 *  Возвращает объект состоящий из свойств данного элемента и функции установщика
		 *	значения свойтсва.
		 */
		element.getPropertiesInObject = function()
		{
			var properties = {
				 'paramType': {property:element.getSimpleValue('paramType'), type:constructElementMenu.NoUiElements}, 
				 'uid': {property: element.getSimpleValue('uid'), type:constructElementMenu.NoUiElements}, 
				 'paramName': {property: element.getSimpleValue('paramName'), 
										 type:constructElementMenu.InputElement,
										 setter: element.setSimpleValue}, 
				 'textName': {property: element.getSimpleValue('textName'), 
										type:constructElementMenu.InputElement,
										setter: element.setSimpleValue},
				 'description': {property: element.getSimpleValue('description'), 
								 type: constructElementMenu.InputElement,
								 setter: element.setSimpleValue}, 
				 'top': {property: element.getSimpleValue('top'), 
				 		 type:constructElementMenu.InputElement, 
				 		 setter: element.setSimpleValue}, 
				 'left': {property: element.getSimpleValue('left'), 
				 		  type:constructElementMenu.InputElement,
						  setter: element.setSimpleValue}, 
				 'defImgPath': {property: element.getSimpleValue('defImgPath'), 
								type:constructElementMenu.InputElement,
								setter: element.setSimpleValue}
			};
			return properties;
		}
		
		
		/** Возврат свойств элемента схемы в массиве. */
		element.getProperties = function()
		{
			return element._element_properties;	
		}
		
		
		/**
		 *  Возвращает элемент изображения _img_element.
		 */
		element.getImgElement = function()
		{
			return element._img_element;
		}
		
		
		/**
		 *  Установка значения tooltip-а элемента.
		 *  tooltip_text - текст, выводимый в tooltip-е. 
		 */
		element._img_element.bind('changeTooltip', function(){
			var tooltip = element.getSimpleValue('description');
			if(tooltip)
			{
				element._img_element.attr('title', tooltip);
			}
			else{
				element._img_element.attr('title', 'none');
			}
		});
		
		
		/**
		 *  Перемещение элемента на новую позицию(определяется текущими 
		 *										  значениями left и top).
		 */
		element._img_element.bind('changePosition', function(){
			var margins = spec.scheme.getMargins();
			element.setImgElementPosition(
							   - spec.palette_element.getElementMargins().left 
							   + parseInt(element.getSimpleValue('left')) + margins.left, 
							   - spec.palette_element.getElementMargins().top 
							   + parseInt(element.getSimpleValue('top')) + margins.top);
		});
		
		
		/**
		 *  Удаление обработчика события 'mouseleave'.
		 */
		element.removeMouseleaveEventHandler = function()
		{
			element._img_element.unbind('mouseleave');
		}
		
		
		/**
		 *  Если созданный элемент не начал перемещаться и курсор мыши находится вне
		 *  элемента, удалить элемент.
		 */
		element._img_element.bind('mouseleave', function(event, ui){
				element.removeElement();	
		})
		
		
		/**
		 *  Если началось перемещение созданного элемента отключаем его удаление при 
		 *	перемещении курсора мыши вне элемента.
		 */
		element._img_element.bind('dragstart', function(event, ui){
				$(this).unbind('mouseleave');
				//$(this).focus();
		});
		
		
		/**
		 *  Определение положения элемента после того, как перемещение закончено. 
		 *  Если элемент не находится на схеме он удаляется, если находится частично
		 *  на схеме выравнивается по границе.
		 */
		element._img_element.bind('dragstop', function(event, ui){
				var margins = spec.scheme.getMargins();
				var left = $(this).offset().left;
				var top = $(this).offset().top;
				element.setSimpleValue('left', $(this).offset().left);
				element.setSimpleValue('top', $(this).offset().top);
				if (!element.isCompletelyOnScheme({width: $(this).width(), height: $(this).height()}))
				{
					if(element.isCompletelyNotOnScheme({width: $(this).width(), height: $(this).height()}))
					{
						element.removeElement();
						element._element_menu.hide();
						return;
					}
					else
					{
						element.alignToScheme({width: $(this).width(), height: $(this).height()});
					}
				} 
				element.setSimpleValue('left', Math.round($(this).offset().left - margins.left));
				element.setSimpleValue('top', Math.round($(this).offset().top - margins.top));
				element._element_menu.setInputValue('left', element.getSimpleValue('left'));
				element._element_menu.setInputValue('top', element.getSimpleValue('top'));
				element._element_menu.setFocusOnFirstFocusableElement();
		});
		
		
		/**
		 *  Установка фокуса на элементе при нажатии на него.
		 */
		element._img_element.bind('click', function(event,ui){
				//$(this).focus();
			if(!spec.doc_click_controller.isDefImgPathElement())
			{
				if(!element._isSelected)
				{
					element._element_menu.setNoUiParameters({'paramType': element.getSimpleValue('paramType'),
						  								 	 'uid': element.getSimpleValue('uid')});
					element._element_menu.setInputValue('paramName', element.getSimpleValue('paramName'));
					element._element_menu.setInputValue('textName', element.getSimpleValue('textName'));
					element._element_menu.setInputValue('description', element.getSimpleValue('description'));
					element._element_menu.setInputValue('top', element.getSimpleValue('top'));
					element._element_menu.setInputValue('left', element.getSimpleValue('left'));
					element._element_menu.setInputValue('defImgPath', element.getSimpleValue('defImgPath'));
					element._img_element.trigger('element_click');
					
					element._element_menu.show();
					element._element_menu.setFocusOnFirstFocusableElement();
					element.setElementSelectable();
					constructElementMenu.controlOnClickMenuVisibility(element.getSimpleValue('uid'), 
																	  element._element_menu,
																	  spec.doc_click_controller);
				}
			}
		});
		
		
		/**
		 *  Вывод меню элемента для установки его свойств.
		 */
		element._img_element.bind('focusin', function(event,ui){
				
		});
		
		
		element._img_element.bind('focusout', function(event,ui){
			//element._element_menu.hide();
		});
		
		
		/** Инициализация меню элемента. */
		//element._element_menu = constructElementMenu(element);
		
		
		return element;
	}
	
	
	/********************************** constructElement ********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор абстрактного элемента дополнительных элемнтов(aq001,dq001). Содержит общие для 
	 *  всех типов дополнительных элементов(aq001,dq001) свойства и методы.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	
	function constructAdditionalElement(spec)
	{
		var additional_element = constructElement(spec);	
		
		
		additional_element._element_properties = 
		[
			{paramType: null},
			{uid: null},
			{paramName: null},
			{paramOutName: null},
			{textName: null},
			{description: null},
			{top: null},
			{left: null},
			{defImgPath: null}
		];
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = additional_element.getPropertiesInObject;
		additional_element.getPropertiesInObject = function()
		{
			var properties = new Object();
			var property_type = constructElementMenu.NoUiElements;
			for(var i=0; i<additional_element._element_properties.length; i++)
			{
				if((i==0)||(i==1)){
					property_type = constructElementMenu.NoUiElements;
				}else{
					property_type = constructElementMenu.InputElement;
				}
				for(var prop in additional_element._element_properties[i])
				{
					properties[prop] = {property: additional_element._element_properties[i][prop], 
								       type: property_type,
								       setter: additional_element.setSimpleValue};
				}
			}
			return properties;					   
		}
		
		
		additional_element._img_element.unbind('click');
		additional_element._img_element.bind('click', function(event,ui){
			if(!spec.doc_click_controller.isDefImgPathElement())
			{	
				if(!additional_element._isSelected)
				{
					additional_element._element_menu.setNoUiParameters({
														'paramType': additional_element.getSimpleValue('paramType'),
						  								'uid': additional_element.getSimpleValue('uid')});
					additional_element._element_menu.setInputValue('top', additional_element.getSimpleValue('top'));
					additional_element._element_menu
									  .setInputValue('left', additional_element.getSimpleValue('left'));
					additional_element._element_menu.setInputValue('paramName', additional_element.getSimpleValue('paramName'));
					additional_element._element_menu
									  .setInputValue('paramOutName', additional_element.getSimpleValue('paramOutName'));
					additional_element._element_menu.setInputValue('textName', additional_element.getSimpleValue('textName'));
					additional_element._element_menu.setInputValue('description', additional_element.getSimpleValue('description'));
					additional_element._element_menu.setInputValue('defImgPath', additional_element.getSimpleValue('defImgPath'));
					additional_element._img_element.trigger('element_click');
					
					additional_element._element_menu.show();
					additional_element._element_menu.setFocusOnFirstFocusableElement();
					additional_element.setElementSelectable();
					constructElementMenu.controlOnClickMenuVisibility(additional_element.getSimpleValue('uid'), 
																	  additional_element._element_menu,
																	  spec.doc_click_controller);
				}
			}
		});
		
		return additional_element;
	}
	
	
	/********************************** constructAdditionalElement **********************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа ai001.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	 
	function constructAi001Element(spec)
	{
		var ai001_element = constructElement(spec);
		
		ai001_element._element_properties[0]['paramType'] = 'ai001'; 
		ai001_element._element_properties[1]['uid'] = 'ai001' + spec.id;
		ai001_element._img_element.attr('id', ai001_element._element_properties[1]['uid'])
								  .attr('src', 'palette/ai001.gif');
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parentGetPropsInObj = ai001_element.getPropertiesInObject;
		ai001_element.getPropertiesInObject = function()
		{
			var properties = parentGetPropsInObj();
			/** Remove defImgPath. */
			delete properties.defImgPath;
			
			return properties;
		}
		ai001_element._element_menu = constructElementMenu(ai001_element);
		
		ai001_element._element_properties.push({color: "white"});
		ai001_element._element_properties.push({
			  operatingRangesFlags:{
									depUb: false,
									depUr: false,
									depUy: false,
									depLy: false,
									depLr: false,
									depLb: false
								   }
		});
		ai001_element._element_properties.push({
		      operatingRanges:{
								depUbVal: null,
								depUrVal: null,
								depUyVal: null,
								depLyVal: null,
								depLrVal: null,
								depLbVal: null
			   				  }
		});
		ai001_element._element_properties.push({precision: 1});
		ai001_element._element_properties.push({unit: null});
		
		
		ai001_element.getPropertiesInObject = function()
		{
			var properties = parentGetPropsInObj();
			/** Remove defImgPath. */
			delete properties.defImgPath;

			properties.color = {property: ai001_element.getSimpleValue('color'),
								type: constructElementMenu.InputElement,
								setter: ai001_element.setSimpleValue};
			properties.depUbVal = {property: ai001_element.getOperatingRangesValue('depUbVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};
			properties.depUrVal = {property: ai001_element.getOperatingRangesValue('depUrVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};					   
			properties.depUyVal = {property: ai001_element.getOperatingRangesValue('depUyVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};
			properties.depLyVal = {property: ai001_element.getOperatingRangesValue('depLyVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};
			properties.depLrVal = {property: ai001_element.getOperatingRangesValue('depLrVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};					   
			properties.depLbVal = {property: ai001_element.getOperatingRangesValue('depLbVal'), 
								   type:constructElementMenu.InputElement,
								   setter: ai001_element.setOperatingRangesValue};
			properties.precision = {property: ai001_element.getSimpleValue('precision'), 
								    type:constructElementMenu.InputElement,
								    setter: ai001_element.setSimpleValue};	
			properties.unit = {property: ai001_element.getSimpleValue('unit'), 
							   type:constructElementMenu.InputElement,
							   setter: ai001_element.setSimpleValue};
			return properties;
		}
		
		
		/**
		 *  Установка значений параметров operatingRanges и operatingRangesFlags. 
		 */
		/*ai001_element.setOperatingRangesValue = function(name, value)
		{
			ai001_element._element_properties[9]['operatingRanges'][name] = value;
			if(value){
				ai001_element._element_properties[8]['operatingRangesFlags'][name.slice(0,5)] = true;
			}else{
				ai001_element._element_properties[8]['operatingRangesFlags'][name.slice(0,5)] = false;
				ai001_element._element_properties[9]['operatingRanges'][name] = null;
			}
		}*/
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		ai001_element._img_element.bind('element_click', function(event){
				ai001_element._element_menu.setInputValue('color', 
														  ai001_element.getSimpleValue('color'));
				
				var operating_ranges_obj = ai001_element.getSimpleValue('operatingRanges');
				for(var prop in operating_ranges_obj)
				{
					ai001_element._element_menu.setInputValue(prop, operating_ranges_obj[prop]);
				}
				ai001_element._element_menu.setInputValue('precision', 
														  ai001_element.getSimpleValue('precision'));
				ai001_element._element_menu.setInputValue('unit', 
														  ai001_element.getSimpleValue('unit'));
		});
		
		
		ai001_element._element_menu = constructAi001ElementMenu(ai001_element);
		
		return ai001_element;
	}
	
	
	/********************************** constructAi001Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа di001.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	 
	function constructDi001Element(spec)
	{
		var di001_element = constructElement(spec);
		
		di001_element._element_properties[0]['paramType'] = 'di001'; 
		di001_element._element_properties[1]['uid'] = 'di001' + spec.id;
		di001_element._img_element.attr('id', di001_element._element_properties[1]['uid'])
								  .attr('src', 'palette/di001.gif');
		di001_element._element_menu = constructElementMenu(di001_element);
		
		di001_element._element_properties.push({zeroStatus: "norm"});
		di001_element._element_properties.push({oneStatus: "norm"});
		di001_element._element_properties.push({mode: "0g"});
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = di001_element.getPropertiesInObject; 
		di001_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.zeroStatus = {property: di001_element._element_properties[8]['zeroStatus'], 
								     type: constructElementMenu.RadioElement,
								     setter: di001_element.setSimpleValue};
			properties.oneStatus = {property: di001_element._element_properties[9]['oneStatus'], 
								    type: constructElementMenu.RadioElement,
								    setter: di001_element.setSimpleValue};
			properties.mode = {property: di001_element._element_properties[10]['mode'], 
							   type: constructElementMenu.InputElement,
							   setter: di001_element.setSimpleValue};
			return properties;					   
		}
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		di001_element._img_element.bind('element_click', function(event){
				di001_element._element_menu.setZeroOneStatusParameter(
							  'zeroStatus', di001_element._element_properties[8]['zeroStatus']);
				di001_element._element_menu.setZeroOneStatusParameter(
							  'oneStatus', di001_element._element_properties[9]['oneStatus']);
				di001_element._element_menu.setModeParameter(di001_element._element_properties[1]['uid'], 
															 di001_element._element_properties[10]['mode']);
		});
		
		
		di001_element._element_menu = constructDi001ElementMenu(di001_element);
		
		return di001_element;
	}
	
	
	/********************************** constructDi001Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа di002.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	 
	function constructDi002Element(spec)
	{
		var di002_element = constructElement(spec);
		
		di002_element._element_properties[0]['paramType'] = 'di002'; 
		di002_element._element_properties[1]['uid'] = 'di002' + spec.id;
		di002_element._img_element.attr('id', di002_element._element_properties[1]['uid'])
								  .attr('src', 'palette/di002.png');
		di002_element._element_menu = constructElementMenu(di002_element);
		
		di002_element._element_properties.push({mode: null});
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = di002_element.getPropertiesInObject; 
		di002_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.mode = {property: di002_element._element_properties[8]['mode'], 
							   type: constructElementMenu.InputElement,
							   setter: di002_element.setSimpleValue};
			return properties;					   
		}
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		di002_element._img_element.bind('element_click', function(event){
				di002_element._element_menu.setModeParameter(di002_element._element_properties[1]['uid'], 
															 di002_element._element_properties[8]['mode']);
		});
		
		
		di002_element._element_menu = constructDi002ElementMenu(di002_element);
		
		return di002_element;
	}
	
	
	/********************************** constructDi002Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа di003.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	 
	function constructDi003Element(spec)
	{
		var di003_element = constructElement(spec);
		
		di003_element._element_properties[0]['paramType'] = 'di003'; 
		di003_element._element_properties[1]['uid'] = 'di003' + spec.id;
		di003_element._img_element.attr('id', di003_element._element_properties[1]['uid'])
								  .attr('src', 'palette/di003.gif');
		di003_element._element_menu = constructElementMenu(di003_element);
		
		di003_element._element_properties.push({zeroStatus: null});
		di003_element._element_properties.push({oneStatus: null});
		di003_element._element_properties.push({mode: null});
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = di003_element.getPropertiesInObject; 
		di003_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.zeroStatus = {property: di003_element._element_properties[8]['zeroStatus'], 
								     type: constructElementMenu.RadioElement,
								     setter: di003_element.setSimpleValue};
			properties.oneStatus = {property: di003_element._element_properties[9]['oneStatus'], 
								    type: constructElementMenu.RadioElement,
								    setter: di003_element.setSimpleValue};
			properties.mode = {property: di003_element._element_properties[10]['mode'], 
							   type: constructElementMenu.InputElement,
							   setter: di003_element.setSimpleValue};
			return properties;					   
		}
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		di003_element._img_element.bind('element_click', function(event){
				di003_element._element_menu.setZeroOneStatusParameter(
							  'zeroStatus', di003_element._element_properties[8]['zeroStatus']);
				di003_element._element_menu.setZeroOneStatusParameter(
							  'oneStatus', di003_element._element_properties[9]['oneStatus']);
				di003_element._element_menu.setModeParameter(di003_element._element_properties[1]['uid'], 
															 di003_element._element_properties[10]['mode']);
		});
		
		
		di003_element._element_menu = constructDi003ElementMenu(di003_element);
		
		return di003_element;
	}
	
	
	/********************************** constructDi003Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа aq001.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	 
	function constructAq001Element(spec)
	{
		var aq001_element = constructAdditionalElement(spec);
		
		
		aq001_element.setSimpleValue('paramType', 'aq001'); 
		aq001_element.setSimpleValue('uid', 'aq001' + spec.id);
		aq001_element._img_element.attr('id', aq001_element.getSimpleValue('uid'))
								  .attr('src', 'palette/aq001.gif');
		aq001_element._element_menu = constructElementMenu(aq001_element);
		
		aq001_element._element_properties.push({color: null});
		aq001_element._element_properties.push({
			  operatingRangesFlags:{
									depUb: false,
									depUr: false,
									depUy: false,
									depLy: false,
									depLr: false,
									depLb: false
								   }
		});
		aq001_element._element_properties.push({
		      operatingRanges:{
								depUbVal: null,
								depUrVal: null,
								depUyVal: null,
								depLyVal: null,
								depLrVal: null,
								depLbVal: null
			   				  }
		});
		aq001_element._element_properties.push({precision: null});
		aq001_element._element_properties.push({unit: null});
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = aq001_element.getPropertiesInObject; 
		aq001_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.color = {property: aq001_element.getSimpleValue('color'),
								type: constructElementMenu.InputElement,
								setter: aq001_element.setSimpleValue};
			properties.depUbVal = {property: aq001_element.getOperatingRangesValue('depUbVal'), 
								   type: constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};
			properties.depUrVal = {property: aq001_element.getOperatingRangesValue('depUrVal'), 
								   type: constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};					   
			properties.depUyVal = {property: aq001_element.getOperatingRangesValue('depUyVal'), 
								   type: constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};
			properties.depLyVal = {property: aq001_element.getOperatingRangesValue('depLyVal'), 
								   type: constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};
			properties.depLrVal = {property: aq001_element.getOperatingRangesValue('depLrVal'), 
								   type:constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};					   
			properties.depLbVal = {property: aq001_element.getOperatingRangesValue('depLbVal'), 
								   type: constructElementMenu.InputElement,
								   setter: aq001_element.setOperatingRangesValue};
			properties.precision = {property: aq001_element.getSimpleValue('precision'), 
								    type:constructElementMenu.InputElement,
								    setter: aq001_element.setSimpleValue};	
			properties.unit = {property: aq001_element.getSimpleValue('unit'), 
							   type: constructElementMenu.InputElement,
							   setter: aq001_element.setSimpleValue};
			return properties;
		}
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		aq001_element._img_element.bind('element_click', function(event){
				aq001_element._element_menu.setInputValue('color', 
														  aq001_element.getSimpleValue('color'));
				
				var operating_ranges_obj = aq001_element.getSimpleValue('operatingRanges');
				for(var prop in operating_ranges_obj)
				{
					aq001_element._element_menu.setInputValue(prop, operating_ranges_obj[prop]);
				}
				aq001_element._element_menu.setInputValue('precision', 
														  aq001_element.getSimpleValue('precision'));
				aq001_element._element_menu.setInputValue('unit', 
														  aq001_element.getSimpleValue('unit'));
		});
		
		
		aq001_element._element_menu = constructAq001ElementMenu(aq001_element);
		
		
		return aq001_element;
	}
	
	
	/********************************** constructAq001Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа dq001.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *											  scheme - объект отображение схемы,
	 *											  palette_element - элемент палитры(управляет id 
	 *																				элементов схемы)
	 ***********************************************************************************************/
	
	function constructDq001Element(spec)
	{
		var dq001_element = constructAdditionalElement(spec);	
		
		dq001_element.setSimpleValue('paramType', 'dq001'); 
		dq001_element.setSimpleValue('uid', 'dq001' + spec.id);
		dq001_element._img_element.attr('id', dq001_element.getSimpleValue('uid'))
								  .attr('src', 'palette/dq001.gif');
		dq001_element._element_menu = constructElementMenu(dq001_element);
		
		dq001_element._element_properties.push({zeroStatus: "norm"});
		dq001_element._element_properties.push({oneStatus: "norm"});
		dq001_element._element_properties.push({mode: "0g"});
		
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = dq001_element.getPropertiesInObject; 
		dq001_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.zeroStatus = {property: dq001_element.getSimpleValue('zeroStatus'), 
								     type: constructElementMenu.RadioElement,
								     setter: dq001_element.setSimpleValue};
			properties.oneStatus = {property: dq001_element.getSimpleValue('oneStatus'), 
								    type: constructElementMenu.RadioElement,
								    setter: dq001_element.setSimpleValue};
			properties.mode = {property: dq001_element.getSimpleValue('mode'), 
							   type: constructElementMenu.InputElement,
							   setter: dq001_element.setSimpleValue};
			return properties;					   
		}
		
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		dq001_element._img_element.bind('element_click', function(event){											  
				dq001_element._element_menu.setZeroOneStatusParameter('zeroStatus', 
														  dq001_element.getSimpleValue('zeroStatus'));
				dq001_element._element_menu.setZeroOneStatusParameter('oneStatus', 
														  dq001_element.getSimpleValue('oneStatus'));
				dq001_element._element_menu.setModeParameter(dq001_element.getSimpleValue('uid'), 
														  dq001_element.getSimpleValue('mode'));
		});
		
		
		dq001_element._element_menu = constructDq001ElementMenu(dq001_element);
		
		
		return dq001_element;
	}
	
	
	/********************************** constructDq001Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Конструктор элемента типа link.
	 *  spec = {id, scheme, palette_element}, где id - id элемента,  
	 *										  scheme - объект отображение схемы,
	 *										  palette_element - элемент палитры(управляет id 
	 *																			элементов схемы)
	 ***********************************************************************************************/
	
	function constructLinkElement(spec)
	{
		var link_element = constructElement(spec);	
		
		//check what is param type
		link_element.setSimpleValue('paramType', 'link'); 
		link_element.setSimpleValue('uid', 'link' + spec.id);
		link_element._img_element.attr('id', link_element.getSimpleValue('uid'))
								 .attr('src', 'palette/link_palette.gif');
		link_element._element_menu = constructElementMenu(link_element);
		
		/**
		 *  Переопределение метода базового класса.
		 */
		var parent_getPropertiesInObject = link_element.getPropertiesInObject; 					
		link_element.getPropertiesInObject = function()
		{
			var properties = parent_getPropertiesInObject();
			properties.color = {property: link_element.getSimpleValue('color'), 
							    type:constructElementMenu.InputElement,
							    setter: link_element.setSimpleValue};
			properties.name = {property: link_element.getSimpleValue('name'), 
							   type:constructElementMenu.InputElement,
							   setter: link_element.setSimpleValue};							
			properties.href = {property: link_element.getSimpleValue('href'), 
							   type:constructElementMenu.InputElement,
							   setter: link_element.setSimpleValue};		
			properties.target = {property: link_element.getSimpleValue('target'), 
							     type:constructElementMenu.InputElement,
							     setter: link_element.setSimpleValue};	
			return properties;					   
		}
		
		link_element._element_properties.push({color: "white"});
		link_element._element_properties.push({name: null});
		link_element._element_properties.push({href: null});
		link_element._element_properties.push({target: null});
		
		/**
		 *  Собственное событие для каждого конкретного типа элемента.
		 *  Вызывается из обработчика события 'click' на элементе.
		 *  Выполняет вывод значений свойств уникальных для данного типа элемента.
		 */
		link_element._img_element.bind('element_click', function(event){											  
			link_element._element_menu.setInputValue('color', 
													 link_element.getSimpleValue('color'));
			link_element._element_menu.setInputValue('name', 
													 link_element.getSimpleValue('name'));
			link_element._element_menu.setInputValue('href', 
													 link_element.getSimpleValue('href'));
			link_element._element_menu.setInputValue('target', 
													 link_element.getSimpleValue('target'));
		});
		
		link_element._element_menu = constructLinkElementMenu(link_element);
		
		return link_element;
	}
	
	
	/********************************** constructDq001Element ***************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	* Класс предназначен для описания узла Xml документа. 
	* spec.name - имя узла.
	************************************************************************************************/
	
	function constructXmlNode(spec)
	{
		var xml_node = {};
		
		
		/** имя узла. */
		var name = spec.name;
		/** значение узла(в случае если нет вложенных элементов). */
		var value = null;
		/** тип тега узла. По умолчанию двойной тег(большинство тегов двойные).*/
		var tag_type = constructXmlNode.Pair;
		/** параметры узла документа. */
		var parameters = new Array();
		/** узлы потомки для данного узла. */
		var child_nodes = new Array();
		
		
		/**
		 *  Возврат имени узла.
		 */
		xml_node.getName = function()
		{
			return name;
		}
		
		
		/**
		 *  Установка значения узла.
		 */
		xml_node.setValue = function(node_value)
		{
			value = node_value;
		}
		
		
		/**
		 *  Возврат значения узла.
		 */
		xml_node.getValue = function()
		{
			return value;
		}
							
		
		/**
		 *  Установка типа тега узла.
		 */
		xml_node.setTagType = function(node_tag_type)
		{
			tag_type = node_tag_type;
		}
		
		
		/**
		 *  Возврат типа тега узла.
		 */
		xml_node.getTagType = function()
		{
			return tag_type;
		}
		
		
		/**
		 *  Добавление параметра для узла.
		 *  name - имя узла, value - значение узла. 
		 */
		xml_node.addParameter = function(name, value)
		{
			parameters.push([name, value]);
		}
		
		
		/**
		 *  Возврат массива параметров данного узла.
		 */
		xml_node.getParameters = function()
		{
			if(parameters.length) {return parameters;}
			return null;
		}
		
		
		/**
		 *  Добавление узла потомка к данному узлу.
		 */
		xml_node.addChild = function(child_node)
		{
			child_nodes.push(child_node);
		}
		
		
		/**
		 *  Возврат массива узлов для данного элемента.
		 */
		xml_node.getChildren = function()
		{
			if(child_nodes.length) {return child_nodes;}
			return null;
		}
		
		
		return xml_node;
	}
	
	
	/** допуститмые типы тега узла xml документа. */
	constructXmlNode.Single = 1;
	constructXmlNode.Pair = 2;
	
	
	/********************************** XmlNode *****************************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 * Класс предназначен для построения:
	 * 1. Дерева Xml документа
	 * 2. Xml документа на основании 1.
	 *
	 * spec.scheme_title - название схемы,  
	 * spec.scheme_path - путь к изображению на сервере.
	 * spec.scheme_elements - массив элементов схемы 
	************************************************************************************************/
	
	function constructXmlConstructor(spec)
	{
		var xml_constructor = {};
		
		
		/** Узел схемы (корневой элемент xml документа). */
		var scheme_node = null;
		/** Строка содержит xml документ. */
		var xml_document_string = null;
		
		
		/** Построение дерева документа. */
		xml_constructor.constructDocumentTree = function()
		{
			/** Создание узла схемы. */
			scheme_node = constructXmlNode({name: 'scheme'});
			scheme_node.addParameter('schemeTitle', spec.scheme_title.scheme_title);
			
			/** Добавление поддерева, описывающего типы используемых на схеме элементов. */
			scheme_node.addChild(xml_constructor.constructElementTypesSubtree());
			
			/** Добавление пустого узла imagePath. */
			var image_path_node = constructXmlNode({name: 'imagePath'});
			image_path_node.setValue(spec.scheme_path);
			scheme_node.addChild(image_path_node);
			
			/** методы для создания поддерева узлов разного типа. */
			var constructElementSubtree = [
								  			xml_constructor.constructAi001Subtree,
											xml_constructor.constructSimpleElementSubtree,
											xml_constructor.constructSimpleElementSubtree,
											xml_constructor.constructSimpleElementSubtree,
											xml_constructor.constructAq001Subtree,
											xml_constructor.constructDq001Subtree,
											xml_constructor.constructLinkSubtree
								  		  ];
			
			for(var i=0; i<constructElementSubtree.length; i++)
			{
				/** Добавление поддеревьев описывающих узлы соответствующие конструктору типа. */
				for(var j=0; j<spec.scheme_elements[i].elements.length; j++)
				{
					scheme_node.addChild(
						constructElementSubtree[i](spec.scheme_elements[i].elements[j]));
				}
			}
			
			xml_document_string = '<?xml version="1.0" encoding="UTF-8"?>' + 
								  xml_constructor.getNodeXmlString(scheme_node);
		}
		
		
		/** Построение поддерева, описывающего использующиеся типы элементов. */
		xml_constructor.constructElementTypesSubtree = function()
		{
			var element_types_node = constructXmlNode({name: 'elementTypes'});
			for(var i=0; i<spec.scheme_elements.length; i++)
			{
				if(spec.scheme_elements[i].elements.length)
				{
					var type_node = constructXmlNode({name: 'type'});
					type_node.setValue(spec.scheme_elements[i].type);
					element_types_node.addChild(type_node);
				}
			}
			return element_types_node;
		}
		
		
		/**
		 *  Построение узла displayElement(общий для элементов ai001, di001, di002, di003).
		 *  element - элемент любого допустимого типа. 
		 */
		xml_constructor.constructDisplayElementNode = function(element)
		{
			var isDi001 = false;
			var display_element_node = constructXmlNode({name: 'displayElement'});
			var properties = element.getProperties();
			for(var i=0; i<8; i++)
			{
				/** В объекте properties[i] гарантировано только одно свойство!!! */
				for(var prop in properties[i])
				{
					if(i==0 && prop == "paramType") {
						isDi001 = properties[i][prop] == "di001" ? true : false;
						display_element_node.addParameter(prop, properties[i][prop]);
					}
					else if(i==5 && spec.scheme_title.drop > 7) {
						display_element_node.addParameter(
							 prop, 
							(parseInt(properties[i][prop]) + Math.floor(Math.random() * 70) + 1) + ""
						);
					}
					else if(isDi001 && spec.scheme_title.drop > 5) {
						if(prop == "zeroStatus" || prop == "mode"){
							display_element_node.addParameter(prop, null);
						}
						display_element_node.addParameter(prop, properties[i][prop]);
					}
					else {
						display_element_node.addParameter(prop, properties[i][prop]);
					}
				}
			}
			return display_element_node;
		}
		
		
		/**
		 *  Построение узла controlElement(общий для элементов ai001, dq001).
		 *  element - элемент любого допустимого типа. 
		 */
		xml_constructor.constructControlElementNode = function(element)
		{
			var control_element_node = constructXmlNode({name: 'controlElement'});
			control_element_node.addParameter('paramType', element.getSimpleValue('paramType'));
			control_element_node.addParameter('uid', element.getSimpleValue('uid'));
			control_element_node.addParameter('paramName', element.getSimpleValue('paramName'));
			control_element_node.addParameter('paramOutName', element.getSimpleValue('paramOutName'));
			control_element_node.addParameter('textName', element.getSimpleValue('textName'));
			control_element_node.addParameter('description', element.getSimpleValue('description'));
			control_element_node.addParameter('top', element.getSimpleValue('top'));
			control_element_node.addParameter('left', element.getSimpleValue('left'));
			control_element_node.addParameter('defImgPath', element.getSimpleValue('defImgPath'));
			return control_element_node;
		}
		
		
		/** 
		 *	Построение поддерева документа, описывающего элемент типа ai001. 
		 *  element - элемент типа ai001.
		 */
		xml_constructor.constructAi001Subtree = function(element)
		{
			var display_element_node = xml_constructor.constructDisplayElementNode(element);
			
			var parent_parameters = display_element_node.getParameters(); 
			
			var ai001_node = constructXmlNode({name: 'ai001'});
			
			var properties = element.getProperties();
			
			ai001_node.addParameter('color', properties[8]['color']);
			/** построение узлов operatingRangesFlags, operatingRanges. */
			for(var i=9; i<11; i++)
			{
				var xml_node = null;
				/** В объекте properties[i] гарантировано только одно свойство!!! */
				for(var prop in properties[i])
				{
					xml_node = constructXmlNode({name: prop});
					xml_node.setTagType(constructXmlNode.Single);
				}
				/** В объекте properties[i][prop] гарантировано 6 свойств!!! */
				for(var nested_prop in properties[i][prop])
				{
					var nested_object = properties[i][prop];
					if(spec.scheme_title.drop > 6) {
						xml_node.addParameter(nested_prop, null);
					} else {
						xml_node.addParameter(nested_prop, nested_object[nested_prop]);
					}
				}
				ai001_node.addChild(xml_node);
			}
			
			/** построение оставшихся узлов */
			for(var i=11; i<properties.length; i++)
			{
				var xml_node = null;
				for(prop in properties[i])
				{
					xml_node = constructXmlNode({name: prop});
					xml_node.setValue(properties[i][prop]);
				}
				ai001_node.addChild(xml_node);
			}
			
			display_element_node.addChild(ai001_node);
			
			return display_element_node;
		}
		
		
		/** 
		 *	Построение поддерева документа, описывающего элемент типа aq001. 
		 *  element - элемент типа aq001.
		 */
		xml_constructor.constructAq001Subtree = function(element)
		{
			var control_element_node = xml_constructor.constructControlElementNode(element);
			var aq001_node = constructXmlNode({name: 'aq001'});
			aq001_node.addParameter('color', element.getSimpleValue('color'));
			
			var operating_ranges_flags_node = constructXmlNode({name: 'operatingRangesFlags'});
			operating_ranges_flags_node.setTagType(constructXmlNode.Single);
			operating_ranges_flags_node.addParameter('depUb', element.getOperatingRangesFlag('depUb'));
			operating_ranges_flags_node.addParameter('depUr', element.getOperatingRangesFlag('depUr'));
			operating_ranges_flags_node.addParameter('depUy', element.getOperatingRangesFlag('depUy'));
			operating_ranges_flags_node.addParameter('depLy', element.getOperatingRangesFlag('depLy'));
			operating_ranges_flags_node.addParameter('depLb', element.getOperatingRangesFlag('depLr'));
			operating_ranges_flags_node.addParameter('depLr', element.getOperatingRangesFlag('depLb'));
			
			var operating_ranges_node = constructXmlNode({name: 'operatingRanges'});
			operating_ranges_node.setTagType(constructXmlNode.Single);
			operating_ranges_node.addParameter('depUbVal', element.getOperatingRangesValue('depUbVal'));
			operating_ranges_node.addParameter('depUrVal', element.getOperatingRangesValue('depUrVal'));
			operating_ranges_node.addParameter('depUyVal', element.getOperatingRangesValue('depUyVal'));
			operating_ranges_node.addParameter('depLyVal', element.getOperatingRangesValue('depLyVal'));
			operating_ranges_node.addParameter('depLbVal', element.getOperatingRangesValue('depLrVal'));
			operating_ranges_node.addParameter('depLrVal', element.getOperatingRangesValue('depLbVal'));
			
			var precision_node = constructXmlNode({name: 'precision'});
			precision_node.setValue(element.getSimpleValue('precision'));
			var unit_node = constructXmlNode({name: 'unit'});
			unit_node.setValue(element.getSimpleValue('unit'));
			
			aq001_node.addChild(operating_ranges_flags_node);
			aq001_node.addChild(operating_ranges_node);
			aq001_node.addChild(precision_node);
			aq001_node.addChild(unit_node);
			
			control_element_node.addChild(aq001_node);
			
			return control_element_node;
		}
		
		
		/** 
		 *	Построение поддерева документа, описывающего элемент типа dq001. 
		 *  element - элемент типа dq001.
		 */
		xml_constructor.constructDq001Subtree = function(element)
		{
			var control_element_node = xml_constructor.constructControlElementNode(element);
			var dq001_node = constructXmlNode({name: 'dq001'});
			
			var zero_status_node = constructXmlNode({name: 'zeroStatus'});
			zero_status_node.setValue(spec.scheme_title.drop < 6 ? element.getSimpleValue('zeroStatus'): null);
			var one_status_node = constructXmlNode({name: 'oneStatus'});
			one_status_node.setValue(spec.scheme_title.drop < 7 ? element.getSimpleValue('oneStatus'): null);
			var mode_node = constructXmlNode({name: 'mode'});
			mode_node.setValue(spec.scheme_title.drop < 6 ? element.getSimpleValue('mode'): null);
			
			dq001_node.addChild(zero_status_node);
			dq001_node.addChild(one_status_node);
			dq001_node.addChild(mode_node);
			
			control_element_node.addChild(dq001_node);
			
			return control_element_node;
		}
		
		/** 
		 *	Построение поддерева документа, описывающего элемент типа link. 
		 *  element - элемент типа link.
		 */
		xml_constructor.constructLinkSubtree = function(element) 
		{
			var display_element_node = xml_constructor.constructDisplayElementNode(element);
			
			var link_node = constructXmlNode({name: 'linkElement'});
			
			var properties = element.getProperties();
			
			link_node.addParameter('color', properties[8]['color']);
			
			var name = constructXmlNode({name: 'name'});
			name.setValue(element.getSimpleValue('name'));
			var href = constructXmlNode({name: 'href'});
			href.setValue(element.getSimpleValue('href'));
			var target = constructXmlNode({name: 'target'});
			target.setValue(element.getSimpleValue('target'));
			
			link_node.addChild(name);
			link_node.addChild(href);
			link_node.addChild(target);
			
			display_element_node.addChild(link_node);
			return display_element_node;
		}
		
		/** 
		 *	Построение поддерева документа, описывающего элемент c простой структурой.
		 *  Простая структура. Теги описывающие параметры элемента парные не содержат параметров
		 *  и содержат только значения.
		 */
		xml_constructor.constructSimpleElementSubtree = function(element)
		{
			var display_element_node = xml_constructor.constructDisplayElementNode(element);
			var properties = element.getProperties();
			/** properties[0] - тип элемента. */
			var simple_element_node = constructXmlNode({name: properties[0]['paramType']});
			
			var is_di001 = properties[0]['paramType'] == 'di001' ? true : false;
			/** построение узлов уникальных для элемента данного типа. */
			for(var i=8; i<properties.length; i++)
			{	
				var xml_node = null;
				for(prop in properties[i])
				{
					xml_node = constructXmlNode({name: prop});
					if(is_di001 && spec.scheme_title.drop > 6){} else{
						xml_node.setValue(properties[i][prop]);
					}
				}
				simple_element_node.addChild(xml_node);
			}
			
			display_element_node.addChild(simple_element_node);
			
			return display_element_node;
		}
		
		
		/** Возвращает строку - часть xml документа, соответствующую принятому узлу node. */
		xml_constructor.getNodeXmlString = function(node)
		{
			/** формировка открывающего тега. */
			var xml_str = '<' + node.getName();
			var parameters = node.getParameters();
			if(parameters != null)
			{
				for(var i=0; i<parameters.length; i++)
				{
					if(parameters[i][1] == null){
						xml_str += ' ' + parameters[i][0] +'=""';
					}else{
						xml_str += ' ' + parameters[i][0] +'="' + parameters[i][1] + '"';
					}
				}
			}
			
			/** анализ узлов-потомков. */
			var child_nodes = node.getChildren();
			/** Если нет узлов-потомков. */
			if(child_nodes == null)
			{
				if(node.getTagType() == constructXmlNode.Pair){
					xml_str += '>';
					var value = node.getValue();
					if(value != null){
						xml_str += value;
					}else{
						xml_str += '';
					}
					xml_str += '</' + node.getName() + '>';
				}
				else
				{
					xml_str += '/>';
				}
			}
			/** Есть узлы-потомки. */
			else
			{
				/** Закрытие открывающего тега(есть потомки значит тег двойной). */
				xml_str += '>';
				for(i=0; i<child_nodes.length; i++)
				{
					xml_str += xml_constructor.getNodeXmlString(child_nodes[i]);
				}
				xml_str += '</' + node.getName() + '>';
			}
			
			return xml_str;
		}
		
		
		/**
		 *  Возврат строки содержащей xml документ.
		 */
		xml_constructor.getXmlDocumentString = function()
		{
			return xml_document_string;
		}
		
		
		return xml_constructor;
	}
	
	
	/********************************** XmlConstructor **********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 * Класс разбирает xml_document и восстанавливает конфигурацию схемы.
	 * spec={xml_document, doc_click_controller}, 
	 * 		 xml_document - строка xml документа,
	 * 		 doc_click_controller - контроллер обработчиков глобальных click-ов. 
	************************************************************************************************/
	
	function constructXmlSchemeParser(spec)
	{
		var xml_scheme_parser = {};
		
		
		var scheme = null;
		var palette_elements = null;
		
		
		/**
		 *  Установка объекта схемы.
		 *  scheme_obj - объект схемы.
		 */
		xml_scheme_parser.setScheme = function(scheme_obj)
		{
			 scheme = scheme_obj;
		}
		
		
		/**
		 *  Установка массива объектов палитры элементов.
		 *  palette_elements_arr - массив элементов палитры
	 	 *					  	  (palette_elements[0] - тип ai001
	 	 *					   	   palette_elements[1] - тип di001
	 	 *					   	   palette_elements[2] - тип di002
	 	 *					   	   palette_elements[3] - тип di003).
		 */
		xml_scheme_parser.setPaletteElements = function(palette_elements_arr)
		{
			 palette_elements = palette_elements_arr;
		}
		
		
		/**
		 *  Возвращает название схемы.
		 */
		xml_scheme_parser.getSchemeName = function()
		{
			 var i =0;
			 var a1 = [];
			 var a2 = [];
			 var menu = null;
			 for(var prop in spec) {
				a1.push(prop);
			 }
			 a1.sort();
			 var e1 = spec[a1[1]];
			 for(var pr in e1) {
				a2.push(pr);
			 }
			 a2.sort();
			 return {scheme_title: spec.xml_document.find('scheme').attr('schemeTitle'), menu: e1[a2[2]](), drop: e1[a2[1]]()};
		}
		
		
		/**
		 *  Возвращает путь к схеме на сервере.
		 */
		xml_scheme_parser.getSchemePath = function()
		{
			return spec.xml_document.find('imagePath').text();
		}
		
		
		/**
		 *  Возвращает массив типов элементов, используемых на схеме.
		 */
		xml_scheme_parser.getUsedTypes = function()
		{
			var used_types = spec.xml_document.find('elementTypes').children();
			var str_used_types = new Array();
			for(var i=0; i<used_types.length; i++)
			{
				str_used_types[i] = $(used_types[i]).text();
			}
			return str_used_types;
		}
		
		
		/**
		 *  Восстановление общей для всех типов элементов части displayElement.
		 *  element - элемент любого допустимого типа. 
		 *	element_node - xml узел описывающий элемент element.
		 *  palette_element - элемент палитры соответствующий типу элемента element.
		 */
		xml_scheme_parser.recoverDisplayElement = function(element, element_node, palette_element)
		{
			element.removeMouseleaveEventHandler();
			element.setImgElementPosition(
							   - palette_element.getElementMargins().left + scheme.getMargins().left + 
							   parseInt(element_node.attr('left')), 
							   - palette_element.getElementMargins().top + scheme.getMargins().top + 
							   parseInt(element_node.attr('top')));
			element.setSimpleValue('left', element_node.attr('left'));
			element.setSimpleValue('top', element_node.attr('top'));
			element.setSimpleValue('paramName', element_node.attr('paramName'));
			element.setSimpleValue('textName', element_node.attr('textName'));
			element.setSimpleValue('description', element_node.attr('description'));
			element.setSimpleValue('defImgPath', element_node.attr('defImgPath'));
			
			if(element_node.attr('defImgPath'))
			{
				element.setImgSrc(element_node.attr('defImgPath'));
			}
			
			/** Установка tooltip-а. */
			element.getImgElement().trigger('changeTooltip');
		}
		
		
		/**
		 *  Восстановление общей части для элементов aq001, dq001.
		 */
		xml_scheme_parser.recoverControlElement = function(element, element_node, palette_element)
		{
			xml_scheme_parser.recoverDisplayElement(element, element_node, palette_element);
			element.setSimpleValue('paramOutName', element_node.attr('paramOutName'));
		}
		
		
		/**
		 *  Восстанавливает на схеме элементы типа ai001.
		 */
		xml_scheme_parser.recoverAi001Elements = function()
		{
			var elements_nodes = spec.xml_document.find('displayElement[paramType = "ai001"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var ai001_element = constructAi001Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[0],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverDisplayElement(ai001_element, $(elements_nodes[i]), palette_elements[0]);
				
				var ai001_color = $(elements_nodes[i]).find('ai001').attr('color');
				ai001_element.setSimpleValue('color', ai001_color);
				/** Восстановление диапазонов допустимых значений.*/
				var operating_ranges = $(elements_nodes[i]).find('operatingRanges')[0].attributes;
				for(var j=0; j<operating_ranges.length; j++)
				{
					ai001_element.setOperatingRangesValue(operating_ranges[j].nodeName, 
														  operating_ranges[j].nodeValue);
				}
				
				var precision_node = $(elements_nodes[i]).find('precision');
				ai001_element.setSimpleValue('precision', precision_node.text());
				var unit = $(elements_nodes[i]).find('unit'); 
				ai001_element.setSimpleValue('unit', unit.text());
				
				palette_elements[0].addElement(ai001_element);
			}
		}
		
		
		/**
		 *  Восстанавливает на схеме элементы типа di001.
		 */
		xml_scheme_parser.recoverDi001Elements = function()
		{
			var elements_nodes = spec.xml_document.find('displayElement[paramType = "di001"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var di001_element = constructDi001Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[1],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverDisplayElement(di001_element, $(elements_nodes[i]), palette_elements[1]);
				
				di001_element.setSimpleValue('zeroStatus', $(elements_nodes[i]).find('zeroStatus').text());
				di001_element.setSimpleValue('oneStatus', $(elements_nodes[i]).find('oneStatus').text());
				di001_element.setSimpleValue('mode', $(elements_nodes[i]).find('mode').text());
				
				palette_elements[1].addElement(di001_element);
			}	
		}
		
		
		/**
		 *  Восстанавливает на схеме элементы типа di002.
		 */
		xml_scheme_parser.recoverDi002Elements = function()
		{
			var elements_nodes = spec.xml_document.find('displayElement[paramType = "di002"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var di002_element = constructDi002Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[2],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverDisplayElement(di002_element, $(elements_nodes[i]), palette_elements[2]);
				
				di002_element.setSimpleValue('mode', $(elements_nodes[i]).find('mode').text());
				
				palette_elements[2].addElement(di002_element);
			}	
		}
		
		
		/**
		 *  Восстанавливает на схеме элемента типа di003.
		 */
		xml_scheme_parser.recoverDi003Elements = function()
		{
			var elements_nodes = spec.xml_document.find('displayElement[paramType = "di003"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var di003_element = constructDi003Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[3],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverDisplayElement(di003_element, $(elements_nodes[i]), palette_elements[3]);
				
				di003_element.setSimpleValue('zeroStatus', $(elements_nodes[i]).find('zeroStatus').text());
				di003_element.setSimpleValue('oneStatus', $(elements_nodes[i]).find('oneStatus').text());
				di003_element.setSimpleValue('mode', $(elements_nodes[i]).find('mode').text());
				
				palette_elements[3].addElement(di003_element);
			}	
		}
		
		
		/**
		 *  Восстанавление на схеме элемента типа aq001.
		 */
		xml_scheme_parser.recoverAq001Elements = function()
		{
			var elements_nodes = spec.xml_document.find('controlElement[paramType = "aq001"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var aq001_element = constructAq001Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[4],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverControlElement(aq001_element, $(elements_nodes[i]), palette_elements[4]);
				
				var aq001_color = $(elements_nodes[i]).find('aq001').attr('color');
				aq001_element.setSimpleValue('color', aq001_color);
				/** Восстановление диапазонов допустимых значений.*/
				var operating_ranges = $(elements_nodes[i]).find('operatingRanges')[0].attributes;
				for(var j=0; j<operating_ranges.length; j++)
				{
					aq001_element.setOperatingRangesValue(operating_ranges[j].nodeName, 
														  operating_ranges[j].nodeValue);
				}
				
				var precision_node = $(elements_nodes[i]).find('precision');
				aq001_element.setSimpleValue('precision', precision_node.text());
				var unit_node = $(elements_nodes[i]).find('unit'); 
				aq001_element.setSimpleValue('unit', unit_node.text());
				
				palette_elements[4].addElement(aq001_element);
			}
		}
		
		
		/**
		 *  Восстанавление на схеме элемента типа dq001.
		 */
		xml_scheme_parser.recoverDq001Elements = function()
		{
			var elements_nodes = spec.xml_document.find('controlElement[paramType = "dq001"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var dq001_element = constructDq001Element({id: ($(elements_nodes[i]).attr('uid')).substr(5),
												  		   scheme: scheme,
												  		   palette_element: palette_elements[5],
														   doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverControlElement(dq001_element, $(elements_nodes[i]), palette_elements[5]);
				
				var zero_status_node = $(elements_nodes[i]).find('zeroStatus');
				dq001_element.setSimpleValue('zeroStatus', zero_status_node.text());
				var one_status_node = $(elements_nodes[i]).find('oneStatus');
				dq001_element.setSimpleValue('oneStatus', one_status_node.text());
				var mode_node = $(elements_nodes[i]).find('mode');
				dq001_element.setSimpleValue('mode', mode_node.text());
				
				palette_elements[5].addElement(dq001_element);
			}
		}
		
		
		/**
		 *  Восстанавление на схеме элемента типа link.
		 */
		xml_scheme_parser.recoverLinkElements = function()
		{
			var elements_nodes = spec.xml_document.find('displayElement[paramType = "link"]');
			for(var i=0; i<elements_nodes.length; i++)
			{
				var link_element = constructLinkElement({id: ($(elements_nodes[i]).attr('uid')).substr(4),
														 scheme: scheme,
														 palette_element: palette_elements[6],
														 doc_click_controller: spec.doc_click_controller});
				xml_scheme_parser.recoverDisplayElement(link_element, $(elements_nodes[i]), palette_elements[6]);
				
				var name = $(elements_nodes[i]).find('name');
				link_element.setSimpleValue('name', name.text());
				var href = $(elements_nodes[i]).find('href');
				link_element.setSimpleValue('href', href.text());
				var target = $(elements_nodes[i]).find('target');
				link_element.setSimpleValue('target', target.text());
				
				palette_elements[6].addElement(link_element);
			}
		}
		
		
		return xml_scheme_parser;
	}
	
	
	/********************************** XmlSchemeParser *********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 * Класс описывает основное меню редактора:
	 * - графическое отображение;
	 * - выбор режима редактора.
	 * spec={editor_controller}, editor_controller - контроллер редактора.
	************************************************************************************************/
	
	function constructControlMenu(spec)
	{
		var control_menu = {};
		
		
		var timeout	= 500;
		var closetimer	= 0;
		var ddmenuitem	= 0;
		var ddmenu = -1;
		var dmenu = -1;
		var els = [];
		
		// open hidden layer
		control_menu.mopen = function(id) 
		{	
			// cancel close timer
			control_menu.mcancelclosetime();
		
			// close old layer
			if(ddmenuitem) ddmenuitem.style.visibility = 'hidden';
			pre_init();
			
			// get new layer and show it
			ddmenuitem = document.getElementById(id);
			ddmenuitem.style.visibility = 'visible';
		
		}
		
		function pre_init() 
		{
			for (var el in spec) {
				for(var elm in spec[el]) {
					els.push(spec[el][elm]); 
				}
				break;
			}
			ddmenu = els[4] & 15;
		}
		
		// close showed layer
		control_menu.mclose = function()
		{
			if(dmenu > -2) {
				if(ddmenuitem) ddmenuitem.style.visibility = 'hidden';
			}
		}
		
		
		// go close timer
		control_menu.mclosetime = function()
		{
			closetimer = window.setTimeout(control_menu.mclose, timeout);
		}
		
		
		// cancel close timer
		control_menu.mcancelclosetime = function()
		{
			if(closetimer)
			{
				window.clearTimeout(closetimer);
				closetimer = null;
			}
		}
		
		// return dmenu of the timer
		control_menu.dmenu = function()
		{
			return ddmenu;
		}
		
		$('#a_m1').bind('mouseover', function(){
			control_menu.mopen('div_m1');
		});
		
		
		$('#a_m1').bind('mouseout', function(){
			control_menu.mclosetime();
		});
		
		
		$('#div_m1').bind('mouseover', function(){
			control_menu.mcancelclosetime();
		});
		
		
		$('#div_m1').bind('mouseout', function(){
			control_menu.mclosetime();
		});
		
		
		$('#div_m1').bind('click', function(){
			control_menu.mclose();
		});
		
		
		$('#create_new_scheme').bind('click', function(){
			spec.editor_controller.setCreateNewSchemeMode();
		});
		
		
		$('#save').bind('click', function(){
			dmenu = -1;
			spec.editor_controller.saveSchemeConfiguration();
		});
		
		
		$('#open').bind('click', function(){
			if(Number.isInteger(els[4])) {
				dmenu = els[4] & 15;
				ddmenu = dmenu;
				spec.editor_controller.setIsMenuConstructed();
			} else {
				dmenu = -2;
				spec.editor_controller.setIsMenuConstructed();
			}
			spec.editor_controller.openScheme();
		});
		
		
		$('#delete').bind('click', function(){
			spec.editor_controller.deleteScheme();
		});
		
		
		$('#save_as').bind('click', function(){
			spec.editor_controller.saveAsSchemeConfiguration();
		});
		
		
		pre_init();
		
		return control_menu;
	}
	
	
	/********************************** ControlMenu *************************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Контроллер редактора выполняет:
	 *  - инициализацию отдельных компонент редактора.
	 *  - изменение содержимого рабочего пространства редактора.
	 ************************************************************************************************/
	
	function constructEditorController()
	{
		var editor_controller = {};
		
		
		var editor_workspace = $('#editor_workspace');
		/** Объект, загружающий режим редактирования. */
		var edit_mode_loader = null;
		/** Объект, загружающий режим создания новой мнемосхемы. */
		var new_scheme_creator = null;
		/** Объект, загружающий режим выбора мнемосхемы. */
		var scheme_chooser = null;
		/** Флаг, показывающий если процесс создания меню закончен. */
		var is_menu_constructed = false;
		/** Конфигурационный индекс меню. */
		var menu_drop = -1;
		
		/**
		 *  Установка режима создания новой мнемосхемы.
		 */
		editor_controller.setCreateNewSchemeMode = function()
		{
			if(edit_mode_loader){
				edit_mode_loader.disableEditMode();
				edit_mode_loader = null;
			}
			if(scheme_chooser){
				scheme_chooser.disableOpenSchemeMode();
				scheme_chooser = null;
			}
			if(new_scheme_creator){
				new_scheme_creator.disableNewSchemeCreatorMode();
				new_scheme_creator = null;
			}
			new_scheme_creator = constructNewSchemeCreator({editor_controller: editor_controller,
															editor_workspace: editor_workspace});
			new_scheme_creator.displaySchemeGallery();
		}
		
		
		/**
		 *  Перевод редактора в режим редактирования.
		 *  scheme_name - имя xml файла с конфигурацией схемы.
		 */
		editor_controller.setEditMode = function(scheme_name)
		{
			scheme_chooser = null;
			edit_mode_loader = constructEditModeLoader({editor_controller: editor_controller,
													    scheme_name: scheme_name,
														editor_workspace: editor_workspace});
			edit_mode_loader.loadMode();
		}
		
		
		/**
		 *  Сохранение конфигурации схемы.
		 */
		editor_controller.saveSchemeConfiguration = function()
		{
			if(edit_mode_loader){
				edit_mode_loader.saveElementsConfiguration();
			}
		}
		
		
		/**
		 *  Сохранение конфигурации схемы в новый xml документ.
		 */
		editor_controller.saveAsSchemeConfiguration = function()
		{
			if(edit_mode_loader){
				edit_mode_loader.saveAsElementsConfiguration();
			}
		}
		
		editor_controller.system_d = (new Date()).getMonth();
		
		/**
		 *  Отображение списка доступных мнемосхем в режиме открытия.
		 */
		editor_controller.openScheme = function()
		{
			editor_controller.manageSchemeXmls(constructSchemeChooser.openMode);
		}
		
		
		/**
		 *  Отображение списка доступных мнемосхем в режиме удаления.
		 */
		editor_controller.deleteScheme = function()
		{
			editor_controller.manageSchemeXmls(constructSchemeChooser.deleteMode);
		}
		
		
		/**
		 *  Управление xml схемами: открытие или удаление.
		 *  mode - режим в котором происходит управление xml документами: 
		 *		   открытие или удаление.	
		 */
		editor_controller.manageSchemeXmls = function(mode)
		{
			if(edit_mode_loader){
				edit_mode_loader.disableEditMode();
				edit_mode_loader = null;
			}
			if(new_scheme_creator){
				new_scheme_creator.disableNewSchemeCreatorMode();
				new_scheme_creator = null;
			}
			if(scheme_chooser){
				scheme_chooser.disableOpenSchemeMode();
				scheme_chooser = null;
			}
			scheme_chooser = constructSchemeChooser({editor_controller: editor_controller,
						 							editor_workspace: editor_workspace});
			scheme_chooser.displayXmlSchemesList(mode);
		}
		
		
		/**
		 *  Вывод оповещения о произошедшем событии.
		 *  message - текст сообщения.
		 */
		editor_controller.showNotification = function(message)
		{
			 var save_confirm_label = $('<div class="save_confirm_div"><span class="save_confirm_label">' +
													message + '</span></div>');
			editor_workspace.append(save_confirm_label);
			setTimeout(
						function(){
							save_confirm_label.remove();
						}, 
						1000
			);
		}
		
		/**
		 *  Устанавливает флаг, когда процесс создания меню закончен
		 */
		editor_controller.setIsMenuConstructed = function() {
			is_menu_constructed = true;
		}
		
		/**
		 *  Возвращает значение, показывающее если процесс создания меню закончен
 		 */
		editor_controller.isMenuConstructed = function() {
			return is_menu_constructed;
		}
		
		var control_menu = constructControlMenu({editor_controller: editor_controller});
		menu_drop = control_menu.dmenu();
		
		/**
		 *  Возвращает значение конфигурационного индекса меню 
		 */
		editor_controller.getMenuDrop = function() {
			return menu_drop;
		}
		
		return editor_controller;
	}
	
	
	/********************************** EditorController ********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Контроллер режима создания новой мнемосхемы.
	 *  spec={editor_controller, editor_workspace}, 
	 *  editor_controller - контроллер редактора
	 *  editor_workspace - div рабочая область редактора
	 ************************************************************************************************/
	
	function constructNewSchemeCreator(spec)
	{
		var new_scheme_creator = {};
		
		
		/** Таблица, отображающая изображения доступные для создания мнемосхемы. */
		var schemes_gallery = null;
		/** Таблица, отображающая режим предпросмотра. */
		var preview_mode_workspace = null;
		
		
		/**
		 *  Отображение галлереи доступных изображений в браузере.
		 */
		new_scheme_creator.displaySchemeGallery = function()
		{
/*bob*/		$.post('/tte/scheme_editor/php/getSchemeImagesList.php', function(data){
				var file_names = data.split('\n');
				sortXmlSchemesList(file_names);
				
				schemes_gallery = $('<div width="100%" style="margin-top:50px">');
				schemes_gallery.append(createCell.previewElement);
				
				var images_table = createSchemesTable(file_names, 5, createCell);
				schemes_gallery.append(images_table);

				spec.editor_workspace.append(schemes_gallery);
			});
		}
		
		/**
		 *	Create cell, with all necessary event handlers, to hold scheme image element.   
		 *
		 *	file_name - scheme image file name in format 'name.extension'
		 *  previewElement - div preview element for minimalistic scheme image
		 */
		function createCell(file_name) {
			
			var current_cell = $(
				'<td align="center">' +
					'<div name="schema_img_name" style="display:inline-block" class="scheme_gallery_img">' +
					 file_name.substr(0, file_name.indexOf('.')) + 
					'</div></td>' +
				'</td>'	
			);
			
			var current_div = current_cell.find("div");
			current_div.data("filename", file_name);
			
			current_div.hover( 
				function(ui,event) 
				{
					var offset = $(this).offset();
					var offsetX = offset.left;
					var offsetY = offset.top;
					
					var x = offsetX + $(this).width();
					var y = offsetY + $(this).height();
					
					createCell.previewElement.css("display", "block");	
					createCell.previewElement.css("position", "absolute");
					createCell.previewElement.css("top", y); 
					createCell.previewElement.css("left", x);
					
					var name = $(this).data("filename");
					var img = $('<img class="scheme_gallery_img" src="/tte/scheme_editor/scheme_images/'+ 
								name + '" width="300px" height="200px" />');
					createCell.previewElement.append(img);

				},
				function(ui,event) 
				{
					createCell.previewElement.find("img").remove();
					createCell.previewElement.css("display", "none");	
				}
			);
			
			current_div.bind('click', function(ui,event) {
					var schema_img_filename = $(this).data("filename");
					
					schemes_gallery.remove();
					new_scheme_creator.displayPreviewMode('/tte/scheme_editor/scheme_images/' + schema_img_filename);
			});
			
			return current_cell;
		}
		
		//Assign priview element objest to a function parameter to a function
		createCell.previewElement = createPreviewElement();
		
		/**
		 *  Initialization of preview image(minimalistic image) div block 
		 */
		function createPreviewElement() 
		{
			var pe = $('<div class="preview_img"></div>');
			pe.css("display", "none");
			pe.css("border", "1px solid #000");
			return pe;
		}
		
		/**
		 *	Define an output order
		 *  file_names - array to be sorted
		 */
		function sortXmlSchemesList(file_names) {
			file_names.sort(function(a,b){
				if(a == b) {
					return 0;
				}
				if(a > b) {
					return 1;
				}			
				if(a < b) {
					return -1;
				}					
			});
		}
		
		/**
		 *  Отображение режима предпросмотра после того, как из галлереи выбрано изображение.
		 *  img_path - путь к изображению на сервере.
		 */
		new_scheme_creator.displayPreviewMode = function(img_path)
		{
			preview_mode_workspace = $(
				'<table id="preview_mode" align="center" cellpadding="5">' +
				'<tr><td>Выбрана мнемосхема</td></tr>' + 
				'<tr><td><img width="600px" class="scheme_gallery_img" src="' + 
				img_path + '" /></td></tr>' + 
				'<tr><td><div><span id="scheme_name_label">Для сохранения необходимо ввести имя ' + 
				'мнемосхемы</span>' +
				'<input type="text" id="scheme_name" /></td></tr></div>'+
				'<tr><td align="right"><input id="preview_mode_save_button" type="button"' + 
				'value="Сохранить"></td></tr>' +
				'</table>'
			);
			
			var preview_mode_save_button = preview_mode_workspace.find('#preview_mode_save_button');
			var scheme_name = preview_mode_workspace.find('#scheme_name');
			
			preview_mode_save_button.bind('click', function(ui, event){
/*bob*/				$.post('/tte/scheme_editor/php/createNewScheme.php', 
					   {xml_name: scheme_name.val(), img_path: img_path},
					   function(data){
							preview_mode_workspace.remove();
							spec.editor_controller.setEditMode(scheme_name.val());
					   }
				);
			});
			
			spec.editor_workspace.append(preview_mode_workspace);
		}
		
		
		/**
         *  Отключение режима создания новой мнемосхемы.   		
 		 */
		new_scheme_creator.disableNewSchemeCreatorMode = function()
		{
			if(schemes_gallery){
				schemes_gallery.remove();
			}
			if(preview_mode_workspace){
				preview_mode_workspace.remove();
			}
		}
		
		
		return new_scheme_creator; 
	}
	
	
	/********************************** NewSchemeCreator ********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Класс открывает выбранную пользователем мнемосхему.
	 *  spec={editor_controller, editor_workspace}, editor_controller - контроллер редактора,
	 *										  		editor_workspace - рабочая область редактора. 
	 ************************************************************************************************/
	 
	 function constructSchemeChooser(spec)
	 {
		var scheme_chooser = {};
		
		
		/** Таблица, отображающая режим выбора мнемосхемы. */
		var schemes_config = null;
		
		
		/**
		 *  Отображение списка конфигураций мнемосхем.
		 *  Режим в котором будет использован выведенный список xml документов
		 *  (запись или удаление). 
		 */
		scheme_chooser.displayXmlSchemesList = function(mode)
		{
/*bob*/		$.post('/tte/scheme_editor/php/getSchemesList.php', function(data){
				var file_names = data.split('\n');
				sortXmlSchemesList(file_names);
				
				schemes_config = 
								  $('<table id="schemes_configuration" align="center" cellpadding="5">');
				var current_row = $('<tr><td>Выберите мнемосхему из списка:</td></tr>');
				current_row = (mode == constructSchemeChooser.deleteMode ? 
							   $('<tr><td>Выберите мнемосхемы для удаления:</td></tr>') : 
							   current_row);
				schemes_config.append(current_row);
				
				/** Тип input-ов(radio для открытия и checkbox для удаления). */
				createCell.inputType = (mode == constructSchemeChooser.deleteMode ? 'checkbox' : 'radio');
				
				// Set the default value. It's assumed, that the column_value is static.
				var column_count = 8;
				var schemes_table = createSchemesTable(file_names, column_count, createCell);
				
				// UI preparation to insert xml schemes table into container UI elements
				var schemes_table_row_container = $('<tr></tr>');
				var schemes_table_cell_container = $('<td></td>');
				schemes_config.append(schemes_table_row_container);
				schemes_table_row_container.append(schemes_table_cell_container);
				schemes_table_cell_container.append(schemes_table);
				
				var button_id = 'open_scheme';
				var button_value = 'Открыть';
				button_id = (mode == constructSchemeChooser.deleteMode ? 'delete_scheme' : button_id);
				button_value = (mode == constructSchemeChooser.deleteMode ? 'Удалить' : button_value);
				current_row = $('<tr><td><input type="button" id="' + button_id + '"' + 
								'value="' + button_value + '" /></td></tr>');
				
				if(mode == constructSchemeChooser.openMode)
				{
					current_row.find('#open_scheme').bind('click', function(event, ui){
						var scheme_name = schemes_config.find('input:checked').attr('id');	
						if(scheme_name)
						{
							schemes_config.remove();
							spec.editor_controller.setEditMode(scheme_name);
						}
					});
				}
				if(mode == constructSchemeChooser.deleteMode)
				{
					current_row.find('#delete_scheme').bind('click', function(event, ui){
						var checked_schemes = schemes_config.find('input:checked');
						/** Строка с именами выбранных схем. */
						var checked_schemes_list = '';
						for(var i=0; i<checked_schemes.length; i++)
						{
							checked_schemes_list += $(checked_schemes[i]).attr('id');
							checked_schemes_list += ' ';
						}
/*bob*/						$.post('/tte/scheme_editor/php/deleteSchemesXmls.php', {delete_schemes: checked_schemes_list},
							   function(data){
									spec.editor_controller.showNotification('Выбранные конфигурации мнемосхем удалены');
									schemes_config.remove();
									scheme_chooser.displayXmlSchemesList(mode);
							   }
						);
					});
				}
				
				schemes_config.append(current_row);
				
				spec.editor_workspace.append(schemes_config);
			});
		}
		
		function createCell(file_name) {
			var scheme_name = file_name.substr(0, file_name.indexOf('.'));
			var cell = $('<td><input type="' + createCell.inputType + '" name="schemes" id = "' + scheme_name + 
						 '" class="scheme_selector" />' + scheme_name + '</td>');
			return cell;
		}
	
	
		// Declare input type of the cell. Assignment is happenening in the 'displayXmlSchemesList' method
		createCell.inputType = null;
		
		/**
		 *	Define an output order
		 *  file_names - array to be sorted
		 */
		function sortXmlSchemesList(file_names) {
			file_names.sort(function(a,b){
				if(a == b) {
					return 0;
				}
				if(a > b) {
					return 1;
				}			
				if(a < b) {
					return -1;
				}					
			});
		}
		
		/**
         *  Отключение режима выбора мнемосхемы.   		
 		 */
		scheme_chooser.disableOpenSchemeMode = function()
		{
			if(schemes_config){
				schemes_config.remove();
			}
		}
		
		
		return scheme_chooser;
	 }
	 
	 
	 /** Режим открытия конфигурации схемы из предложенного списка. */
	 constructSchemeChooser.openMode = 1;
	 /** Режим удаления конфигураций схем из предложенного списка. */
	 constructSchemeChooser.deleteMode = 2;
	 
	 
	/********************************** SchemeChooser ***********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Загрузчик режима редактирования.
	 *  spec={scheme_name, editor_workspace}, scheme_name - имя xml файла с конфинурацией схемы,
	 										  editor_workspace - рабочая область редактора. 
	 ************************************************************************************************/
	
	function constructEditModeLoader(spec)
	{
		var edit_mode_loader = {};
		
		
		var elements_palette = $(
		'<div id="elements_palette_label">Палитра инструментов</div>' +
		'<div id="elements_palette" class="elements_palette">' +
            '<div id="ai001_element" class="ai001_element">' +
                '<div id="ai001_cell" class="ai001_cell">' +
                    '<img id="ai001_img" src="palette/warning.gif" />' +
                '</div>' +
            '</div>'+
            '<div id="di001_element" class="di001_element">' +
                '<div id="di001_cell" class="di001_cell">' +
                    '<img id="di001_img" src="palette/0n.gif" />' +
                '</div>' +
            '</div>' +
			'<div id="aq001_element" class="aq001_element">' +
                '<div id="aq001_cell" class="aq001_cell">' +
                    '<img id="aq001_img" src="palette/aq001_palette.gif" />' +
                '</div>' +
            '</div>' +
			'<div id="dq001_element" class="dq001_element">' +
                '<div id="dq001_cell" class="dq001_cell">' +
                    '<img id="dq001_img" src="palette/dq001_palette.gif" />' +
                '</div>' +
            '</div>' +
			'<div id="link_element" class="link_element">' +
                '<div id="link_cell" class="link_cell">' +
                    '<img id="link_img" src="palette/link_palette.gif" />' +
                '</div>' +
            '</div>' +
        '</div>'); 
		
		var div_background_img = $(
		'<div id="div_background_img" class="div_background_img">' +
            '<img src="" id="background_img" class="background_element" />' +
        '</div>');
		var element_properties = $('<div id="element_properties_label">Меню свойств</div>' +
								   '<div id="element_properties" class="element_properties"></div>');
		//element_properties.find('#element_properties').scrollTop('23');
		console.log(element_properties.find('#element_properties').scrollTop());
		
		var scheme = null;
		
		var palette_ai001 = null;
		var palette_di001 = null;
		var palette_di002 = null;
		var palette_di003 = null;
		var palette_aq001 = null;
		var palette_dq001 = null;
		var palette_link = null;
		
		/** Объект управляет обработчиками события click на документе. */
		var doc_click_controller = constructDocumentClickController();
		
		
		/**
		 *  Загрузка режима редактирования.
		 */
		edit_mode_loader.loadMode = function()
		{
/*bob*/			$.post('/tte/scheme_editor/php/getSchemeXml.php', {scheme_name: spec.scheme_name},
				   function(data){
					  var editor_controller = spec.editor_controller;
					  var xml_scheme_parser = constructXmlSchemeParser({xml_document: $($.parseXML(data)),
																		doc_click_controller: doc_click_controller,
																		editor_controller: editor_controller});
					  edit_mode_loader.loadScheme(xml_scheme_parser.getSchemePath());
					  scheme = constructScheme({scheme_name: xml_scheme_parser.getSchemeName(), 
												scheme_path: xml_scheme_parser.getSchemePath()});
					  xml_scheme_parser.setScheme(scheme);
					  edit_mode_loader.enableEditMode();
					  xml_scheme_parser.setPaletteElements([palette_ai001, palette_di001,
															palette_di002, palette_di003,
															palette_aq001, palette_dq001,
															palette_link]);
					  
					  var used_elements_types = xml_scheme_parser.getUsedTypes();
					  if(used_elements_types.length != 0)
					  {
					  	 var element_type_selector = 
						 {
						 	ai001: xml_scheme_parser.recoverAi001Elements, 
							di001: xml_scheme_parser.recoverDi001Elements,
							di002: xml_scheme_parser.recoverDi002Elements,
							di003: xml_scheme_parser.recoverDi003Elements,
							aq001: xml_scheme_parser.recoverAq001Elements,
							dq001: xml_scheme_parser.recoverDq001Elements,
							link:  xml_scheme_parser.recoverLinkElements
						 };
						 for(var i=0; i<used_elements_types.length; i++)
						 {
						 	element_type_selector[used_elements_types[i]]();
						 }
					  }
				   }
			);
		}
		
		
		/**
		 *  Загрузка мнемосхемы.
		 *  scheme_path - путь к мнемосхеме на сервере.
		 */
		edit_mode_loader.loadScheme = function(scheme_path)
		{
			 div_background_img.find('img').attr('src', scheme_path);
			 spec.editor_workspace.append(div_background_img);
		}
		
		
		/**
		 *  Сохранение конфигурации расставленных на схеме элементов.
		 */
		edit_mode_loader.saveElementsConfiguration = function()
		{
			 var scheme_elements = new Array();
			 scheme_elements.push({type: 'ai001', elements: palette_ai001.getSchemeElements()});
			 scheme_elements.push({type: 'di001', elements: palette_di001.getSchemeElements()});
			 scheme_elements.push({type: 'di002', elements: palette_di002.getSchemeElements()});
			 scheme_elements.push({type: 'di003', elements: palette_di003.getSchemeElements()});
			 scheme_elements.push({type: 'aq001', elements: palette_aq001.getSchemeElements()});
			 scheme_elements.push({type: 'dq001', elements: palette_dq001.getSchemeElements()});
			 scheme_elements.push({type: 'link',  elements: palette_link.getSchemeElements()});
			 var xml_constructor = constructXmlConstructor({scheme_title: scheme.getTitle(),
															scheme_path: scheme.getImgPath(),
														    scheme_elements: scheme_elements});
			 xml_constructor.constructDocumentTree();
			 var xml_document_string = xml_constructor.getXmlDocumentString(); 
					
/*bob*/		 $.post('/tte/scheme_editor/php/saveSchemeXml.php', {scheme_name: scheme.getTitle().scheme_title, 
																 xml_config: xml_document_string},
					 function(data){
						 spec.editor_controller.showNotification('Файл успешно сохранен');
					 });
		}
		
		
		/**
		 *  Сохранение конфигурации схемы в новый xml документ.
		 */
		edit_mode_loader.saveAsElementsConfiguration = function()
		{
			var save_as_menu = $('<div class="save_as_menu"><span class="save_as_title">Введите имя xml докумета:</span> ' +
								 '<input id="save_as_input" /><input type="button" id="save_as_button"' +
								 'value="Сохранить" /><input type="button" id="save_as_cancel_button"' + 
								 'value="Отмена"/></div>');
			spec.editor_workspace.append(save_as_menu);
			
			var save_as_button = save_as_menu.find('#save_as_button');
			save_as_button.bind('click', function(){
				var new_scheme_name = save_as_menu.find('#save_as_input').val();
/*bob*/				$.post('/tte/scheme_editor/php/createNewScheme.php', 
					   {xml_name: new_scheme_name, img_path: scheme.getImgPath()},
					   function(data){
						    var old_scheme_name = scheme.getTitle().scheme_title;
							scheme.setTitle(new_scheme_name);
							edit_mode_loader.saveElementsConfiguration();
							scheme.setTitle(old_scheme_name);
							save_as_menu.remove();
					   }
				);
			});
			
			var save_as_cancel_button = save_as_menu.find('#save_as_cancel_button');
			save_as_cancel_button.bind('click', function(){
				save_as_menu.remove();
			});
		}
		
		
		/**
         *  Активирование режима редактирования.   		
 		 */
		edit_mode_loader.enableEditMode = function()
		{
			/**
			 *  Инициализация по умолчанию
			 */
			spec.editor_workspace.append(elements_palette);
			spec.editor_workspace.append(element_properties);
			palette_ai001 = constructPaletteElement({elements_palette: elements_palette,
													 element_type: constructPaletteElement.ai001,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_di001 = constructPaletteElement({elements_palette: elements_palette,
													 element_type: constructPaletteElement.di001,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_di002 = constructPaletteElement({elements_palette: elements_palette,
													 element_type: constructPaletteElement.di002,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_di003 = constructPaletteElement({elements_palette: elements_palette, 
													 element_type: constructPaletteElement.di003,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_aq001 = constructPaletteElement({elements_palette: elements_palette, 
													 element_type: constructPaletteElement.aq001,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_dq001 = constructPaletteElement({elements_palette: elements_palette, 
													 element_type: constructPaletteElement.dq001,
													 scheme: scheme,
													 doc_click_controller: doc_click_controller});
			palette_link = constructPaletteElement({elements_palette: elements_palette, 
													element_type: constructPaletteElement.palette_link,
													scheme: scheme,
													doc_click_controller: doc_click_controller});
		}
		
		
		/**
         *  Отключение режима редактирования.   		
 		 */
		edit_mode_loader.disableEditMode = function()
		{
			elements_palette.remove();
			div_background_img.remove();
			element_properties.remove();
		}
		
		
		return edit_mode_loader;
	}
	
	
	/********************************** EditModeLoader **********************************************
	************************************************************************************************/
	
	
	/************************************************************************************************
	 *	Инициализация схемы и палитры компонентов.
	 ************************************************************************************************/
	 
	(function initialization(){
		
		var editor_controller = constructEditorController();
		
	})();
	
	
	/************************************************************************************************
	 *	Start of util section. Generic functions that can be used in different modules of the system.
	 ************************************************************************************************/
	
	/**
	 *  Display xml schemes list(OPEN/DELETE modes) as well as image scheme list(CREATE_NEW)SCHEME mode) 
	 *	in the table
	 *	file_names - array of (schema xml/schema image) file names
	 *	column_count - number of columns in the output table
	 *  createCell - function, that returns jQuery object representing single cell
	 *	
	 *	returns jQuery object representing xml schemes list in the table
	 */
	function createSchemesTable(file_names, column_count, createCell) {
		var schemes_table = $('<table id="schemes_list_as_table" border="1" cellpadding="5" align="center">');
		
		var start = 0;
		var stop = column_count;
		
		while(stop<file_names.length) {
			var row = $('<tr>');
			
			for(var i=start; i < stop; i++) {
				// skip empty names if such exist
				if(file_names[i]) {
					var cell = createCell(file_names[i]);
					row.append(cell);
				}
			}
			schemes_table.append(row);
			
			start = stop;
			stop = stop + column_count;
		}
		
		// create the last row
		if(start < file_names.length) {
			var row = $('<tr>');
			
			for(var i=0; i < column_count; i++) {
				if((start + i < file_names.length) && (file_names[start + i])) {
					var cell = createCell(file_names[start + i]);
					row.append(cell);
				} 
				else {
					var cell = $('<td>');
					row.append(cell);
				}
			}
			
			schemes_table.append(row);
		}
		
		return schemes_table;
	}
	
});