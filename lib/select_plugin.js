

(function( $ ){
  
  
  function constructImgSelect(spec)
  {
	  var img_select_obj = {};
	  
	  
	  /** Div контейнер для select элементов. */
	  var select_container = null;
	  /** Основной элемент. */
      var select = spec.select;
	  /** Выпадающий элемент. */
      var img_gallery = null;
	  
      /** id элемента, связанного с создаваемым input-ом. */
      var element_uid = spec.element_uid;
      /** Расположение основного элемента. */
      var select_position = spec.position;
     /** Флаг видимости выпадающего элемента. */
      var isImgGalleryVisible = false;
	   
	   
	  /**
	   *  Инициализация выпадающего элемента.
	   */
	  img_select_obj.loadImgGallery = function()
	  {
	      $.post('php/getImgList.php', function(data){
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
			img_select_obj.setTdsMouseListeners(img_gallery.find('td'));
			img_gallery.css('position', 'relative')
					   .css('top', 0)
			           .css('left', 0);		   		   
		});
	  }
	  
	  
	  /**
	   *  Установка обработчиков событий mouseover, mouseout, click на контейнер изображения.
	   */
	  img_select_obj.setTdsMouseListeners = function(tds)
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
	  img_select_obj.controlDropDownElementVisibility = function(clicked_element_id)
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
	   *  Конструктор объекта img_select_obj. 
	   */
	  img_select_obj.construct = function()
	  {
		  constructImgSelect.controlOutOfDropDownElementClick(img_select_obj, element_uid);
		  
		  //spec.container.css('position', 'absolute');
		  select.remove();
		  select_container = $('<div id="plugin_div_img_select">');
		  //select.css('position', 'absolute') 
		  //		.css('top', 0)
			//	.css('left', 0)
		  //select.css('width', select_dimension.width)
		  //	   .css('height', select_dimension.height)
				//.css('background-color', 'red');*/
		  select_container.append(select);
		  
		  select.bind('click', function(e){
				/** Отключение глобального обработчика click для input-a defImgPath. */
	      		doc_click_controller.unbindHandler(element_uid);					
		  });
		  
		  spec.container.append(select_container);		
		  img_select_obj.loadImgGallery();	  
	  }
	  
	  
	  img_select_obj.construct();
	  
	  
	  return img_select_obj;
  }
  
  
  /**
   *  Проверка на каком элементе документа произошел click.
   */
  constructImgSelect.controlOutOfDropDownElementClick = function(img_select_obj, element_uid)
  {
	  var click_handler = function(e){
		 var clicked_element = $(e.target).attr('id');
		 img_select_obj.controlDropDownElementVisibility(clicked_element);
	  };
	  doc_click_controller.addHandler('defImgPath_' + element_uid, click_handler);
	  //doc_click_controller.bindHandler('defImgPath_' + element_uid);
  }
  
  
  //var img_select_obj = null;
  var doc_click_controller = null;
  //var element_uid = null;
  
  
  /**
   *  container - элемент контейнер в котором находится элемент this.
   *  doc_click_controller - контроллер обработчиков глобального события 'click'.
   *  uid - идентификатор элемента.
   */
  $.fn.imgSelect = function(container, dcc, uid) {
	 doc_click_controller = dcc;
	 //element_uid = uid;
	 var img_select_obj = constructImgSelect({select: this, container: container, 
										      dimension: {width: this.css('width'), 
										 			      height: this.css('height')},
											  element_uid: uid}); 
	 //constructImgSelect.controlOutOfDropDownElementClick(img_select_obj);
  }
  
  
  /**
   *  Отключение обработчика глобального 'click' для данного элемента. 
   */
  $.fn.unbindHandler = function()
  {
	  doc_click_controller.unbindHandler('defImgPath_' + element_uid);
  }
  
  
  /**
   *  Подключение обработчика глобального 'click' для данного элемента. 
   */
  $.fn.bindHandler = function()
  {
      doc_click_controller.bindHandler('defImgPath_' + element_uid);
  }
  
  
})( jQuery );