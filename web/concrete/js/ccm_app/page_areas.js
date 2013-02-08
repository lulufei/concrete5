
/** 
 * General Edit UI Controls
 */

ccm_mainNavDisableDirectExit = function(disableShow) {
	// make sure that exit edit mode is enabled
	$("#ccm-exit-edit-mode-direct").hide();
	if (!disableShow) {
		$("#ccm-exit-edit-mode-comment").show();
	}
}

ccm_editInit = function() {
	document.write = function() {
		// stupid javascript in html blocks
		void(0);
	}

	ccm_editMenuInit();
}

ccm_editMenuInit = function() {
	$('a.dialog-launch').dialog();
	$('.ccm-area').ccmmenu();
	$('.ccm-block-edit').ccmmenu();
	$('.ccm-block-edit-layout').ccmmenu();
}

ccm_goToSitemapNode = function(cID, cName) {
	window.location.href= CCM_DISPATCHER_FILENAME + '?cID=' + cID;
}

// legacy menu. Will go away when all are converted to bootstrap menus
ccm_fadeInMenu = function(bobj, e) {
	var mwidth = bobj.find('div.popover div.inner').width();
	var mheight = bobj.find('div.popover').height();
	bobj.hide();
	bobj.css('visibility', 'visible');
	
	var posX = e.pageX + 2;
	var posY = e.pageY + 2;

	if ($(window).height() < e.clientY + mheight) {
		posY = posY - mheight - 10;
		posX = posX - (mwidth / 2);
		bobj.find('div.popover').removeClass('below');
		bobj.find('div.popover').addClass('above');
	} else {
		posX = posX - (mwidth / 2);
		posY = posY + 10;
		bobj.find('div.popover').removeClass('above');
		bobj.find('div.popover').addClass('below');
	}	
	
	bobj.css("top", posY + "px");
	bobj.css("left", posX + "px");
	bobj.fadeIn(60);
}

//legacy menu hide
ccm_hideMenus = function() {
	/* 1st, hide all items w/the css menu class */
	ccm_activeMenu = false;
	$("div.ccm-menu").hide();
	$("div.ccm-menu").css('visibility', 'hidden');
	$("div.ccm-menu").show();
}

/** 
 * Block error reporting
 */
var ccm_isBlockError = false;
var ccm_blockError = false;

ccm_addError = function(err) {
	if (!ccm_isBlockError) {
		ccm_blockError = '';
		ccm_blockError += '<ul>';
	}
	
	ccm_isBlockError = true;
	ccm_blockError += "<li>" + err + "</li>";;
}

ccm_resetBlockErrors = function() {
	ccm_isBlockError = false;
	ccm_blockError = "";
}


/** 
 * Blocks
 */

ccm_openAreaAddBlock = function(arHandle, addOnly, cID) {
	if (!addOnly) {	
		addOnly = 0;
	}
	
	if (!cID) {
		cID = CCM_CID;
	}
	
	$.fn.dialog.open({
		title: ccmi18n.blockAreaMenu,
		href: CCM_TOOLS_PATH + '/edit_area_popup.php?cID=' + cID + '&atask=add&arHandle=' + arHandle + '&addOnly=' + addOnly,
		width: 550,
		modal: false,
		height: 380
	});
}

ccm_addToScrapbook = function(cID, bID, arHandle) {
	ccm_mainNavDisableDirectExit();
	// got to grab the message too, eventually
	$.ajax({
	type: 'POST',
	url: CCM_TOOLS_PATH + '/pile_manager.php',
	data: 'cID=' + cID + '&bID=' + bID + '&arHandle=' + arHandle + '&btask=add&scrapbookName=userScrapbook',
	success: function(resp) {
		ccmAlert.hud(ccmi18n.copyBlockToScrapbookMsg, 2000, 'add', ccmi18n.copyBlockToScrapbook);
	}});		
}

ccm_deleteBlock = function(cID, bID, aID, arHandle, msg) {
	if (confirm(msg)) {
		ccm_mainNavDisableDirectExit();
		// got to grab the message too, eventually
		$d = $("#b" + bID + '-' + aID);
		$d.hide().remove();
		ccmAlert.hud(ccmi18n.deleteBlockMsg, 2000, 'delete_small', ccmi18n.deleteBlock);
		$.ajax({
			type: 'POST',
			url: CCM_DISPATCHER_FILENAME,
			data: 'cID=' + cID + '&ccm_token=' + CCM_SECURITY_TOKEN + '&isAjax=true&btask=remove&bID=' + bID + '&arHandle=' + arHandle
		});
	}	
}

ccm_parseBlockResponse = function(r, currentBlockID, task) {
	try { 
		r = r.replace(/(<([^>]+)>)/ig,""); // because some plugins add bogus HTML after our JSON requests and screw everything up
		resp = eval('(' + r + ')');
		if (resp.error == true) {
			var message = '<ul>'
			for (i = 0; i < resp.response.length; i++) {						
				message += '<li>' + resp.response[i] + '<\/li>';
			}
			message += '<\/ul>';
			ccmAlert.notice(ccmi18n.error, message);
		} else {
			ccm_blockWindowClose();
			if (resp.cID) {
				cID = resp.cID; 
			} else {
				cID = CCM_CID;
			}
			var action = CCM_TOOLS_PATH + '/edit_block_popup?cID=' + cID + '&bID=' + resp.bID + '&arHandle=' + encodeURIComponent(resp.arHandle) + '&btask=view_edit_mode';	 
			$.get(action, 		
				function(r) { 
					if (task == 'add') {
						$('#ccm-add-new-block-placeholder').before(r).remove();
						ccm_saveAreaArrangement(cID, resp.arHandle);
						/*
						if ($("#a" + resp.aID + " div.ccm-area-styles-a"+ resp.aID).length > 0) {
							$("#a" + resp.aID + " div.ccm-area-styles-a"+ resp.aID).append(r);
						} else {
							$("#a" + resp.aID).append(r);
						}
						// inline support.
						$('#a' + resp.aID + '-bt' + resp.btID).remove();
						*/

					} else {
						$('#b' + currentBlockID + '-' + resp.aID).before(r).remove();
					}
					ccm_editMenuInit();
					ccm_exitInlineEditMode();
					ccm_mainNavDisableDirectExit();
					if (task == 'add') {
						ccmAlert.hud(ccmi18n.addBlockMsg, 2000, 'add', ccmi18n.addBlock);
						jQuery.fn.dialog.closeAll();
					} else {
						ccmAlert.hud(ccmi18n.updateBlockMsg, 2000, 'success', ccmi18n.updateBlock);
					}
					if (typeof window.ccm_parseBlockResponsePost == 'function') {
						ccm_parseBlockResponsePost(resp);
					}
				}
			);
		}
	} catch(e) { 
		ccmAlert.notice(ccmi18n.error, r); 
	}
}

ccm_setupBlockForm = function(form, currentBlockID, task) {
	form.ajaxForm({
		type: 'POST',
		iframe: true,
		beforeSubmit: function() {
			$('input[name=ccm-block-form-method]').val('AJAX');
			jQuery.fn.dialog.showLoader();
			return ccm_blockFormSubmit();
		},
		success: function(r) {
			ccm_parseBlockResponse(r, currentBlockID, task);
		}
	});
	
}

ccm_saveArrangement = function(cID) {
	
	if (!cID) {
		cID = CCM_CID;
	}

	ccm_mainNavDisableDirectExit();
	var serial = '';
	$('div.ccm-area').each(function() {
		areaStr = '&area[' + $(this).attr('id').substring(1) + '][]=';
		
		bArray = $(this).sortable('toArray');

		for (i = 0; i < bArray.length; i++ ) {
			if (bArray[i] != '' && bArray[i].substring(0, 1) == 'b') {
				// make sure to only go from b to -, meaning b28-9 becomes "28"
				var bID = bArray[i].substring(1, bArray[i].indexOf('-'));
				var bObj = $('#' + bArray[i]);
				if (bObj.attr('custom-style')) {
					bID += '-' + bObj.attr('custom-style');
				}
				serial += areaStr + bID;
			}
		}
	});

 	$.ajax({
 		type: 'POST',
 		url: CCM_DISPATCHER_FILENAME,
 		data: 'cID=' + cID + '&ccm_token=' + CCM_SECURITY_TOKEN + '&btask=ajax_do_arrange' + serial,
 		success: function(msg) {
 			$("div.ccm-area").removeClass('ccm-move-mode');
			$('div.ccm-block-arrange').each(function() {
				$(this).addClass('ccm-block-edit');
				$(this).removeClass('ccm-block-arrange');
			});
			$('div.ccm-area-footer').show();
			$.fn.ccmmenu.enable();
			$(".ccm-main-nav-edit-option").fadeIn(300);
			ccmAlert.hud(ccmi18n.arrangeBlockMsg, 2000, 'up_down', ccmi18n.arrangeBlock);
 		}});
}

ccm_saveAreaArrangement = function(cID, arHandle) {
	
	if (!cID) {
		cID = CCM_CID;
	}

	var serial = '';
	var $area = $('div.ccm-area[data-area-handle=' + arHandle + ']');
	areaStr = '&area[' + $area.attr('id').substring(1) + '][]=';
	bArray = $area.sortable('toArray');
	for (i = 0; i < bArray.length; i++ ) {
		if (bArray[i] != '' && bArray[i].substring(0, 1) == 'b') {
			// make sure to only go from b to -, meaning b28-9 becomes "28"
			var bID = bArray[i].substring(1, bArray[i].indexOf('-'));
			var bObj = $('#' + bArray[i]);
			if (bObj.attr('custom-style')) {
				bID += '-' + bObj.attr('custom-style');
			}
			serial += areaStr + bID;
		}
	}

 	$.ajax({
 		type: 'POST',
 		url: CCM_DISPATCHER_FILENAME,
 		data: 'cID=' + cID + '&ccm_token=' + CCM_SECURITY_TOKEN + '&btask=ajax_do_arrange' + serial
 	});
}

ccm_arrangeInit = function() {
	//$(document.body).append('<img src="' + CCM_IMAGE_PATH + '/topbar_throbber.gif" width="16" height="16" id="ccm-topbar-loader" />');
	
	$.fn.ccmmenu.disable();
	
	$('div.ccm-block-edit').each(function() {
		$(this).addClass('ccm-block-arrange-enabled');
	});
	
	$('div.ccm-area-footer').hide();

	$("div.ccm-area").each(function() {
		var cID = $(this).attr('cID');
		$(this).addClass('ccm-move-mode');
		$(this).sortable({
			items: 'div.ccm-block-arrange-enabled',
			connectWith: $("div.ccm-area"),
			accept: 'div.ccm-block-arrange',
			opacity: 0.5,
			placeholder: "ccm-block-type-drop-holder",
			opacity: 0.4,
			stop: function() {
				ccm_saveArrangement(cID);
			}
		});
	});
}

ccm_blockWindowClose = function() {
	jQuery.fn.dialog.closeTop();
	ccm_blockWindowAfterClose();
}

ccm_blockWindowAfterClose = function() {
	ccmValidateBlockForm = function() {return true;}
}

ccm_blockFormSubmit = function() {
	if (typeof window.ccmValidateBlockForm == 'function') {
		r = window.ccmValidateBlockForm();
		if (ccm_isBlockError) {
			jQuery.fn.dialog.hideLoader();
			if(ccm_blockError) {
				ccmAlert.notice(ccmi18n.error, ccm_blockError + '</ul>');
			}
			ccm_resetBlockErrors();
			return false;
		}
	}
	return true;
}