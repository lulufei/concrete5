<?
	defined('C5_EXECUTE') or die("Access Denied.");
	$minColumns = 1;

	$presets = AreaLayoutPreset::getList();
?>

<ul id="ccm-layouts-toolbar" class="ccm-sub-toolbar ccm-ui">
	<li data-area-presets-view="presets" class="ccm-sub-toolbar-icon-cell"><a class="toolbar-icon dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)"><i class="glyphicon glyphicon-bookmark"></i></a>
	  <ul class="dropdown-menu ccm-dropdown-area-layout-presets">
	  	<? foreach($presets as $pr) { ?>
		    <li><a href="javascript:void(0)" data-area-layout-preset-id="<?=$pr->getAreaLayoutPresetID()?>"><?=$pr->getAreaLayoutPresetName()?></a></li>
		<? } ?>
		<li class="ccm-dropdown-area-layout-presets-manage divider"></li>
		<li class="ccm-dropdown-area-layout-presets-manage"><a href="javascript:void(0)" onclick="CCMLayout.launchPresets('#ccm-layouts-edit-mode', '<?=Loader::helper('validation/token')->generate('layout_presets')?>', 'delete')"><?=t('Manage Presets')?></a></li>
	  </ul>
	</li>
	<li data-area-presets-view="presets" class="ccm-sub-toolbar-separator"></li>
	<li class="ccm-sub-toolbar-text-cell" data-grid-form-view="choosetype">
		<label for="useThemeGrid"><?=t("Grid Type")?></label>
		<select name="useThemeGrid" id="useThemeGrid" style="width: auto !important">
			<option value="1"><?=$themeGridName?></option>
			<option value="0"><?=t('Free-Form Layout')?></option>
		</select>
	</li>
	<li data-grid-form-view="choosetype" class="ccm-sub-toolbar-separator"></li>
	<li data-grid-form-view="themegrid" class="ccm-sub-toolbar-text-cell">
		<label for="themeGridColumns"><?=t("Columns")?></label>
		
		<select name="themeGridColumns" id="themeGridColumns">
			<? for ($i = $minColumns; $i <= $themeGridMaxColumns; $i++) { ?>
				<option value="<?=$i?>" <? if ($columnsNum == $i) { ?> selected <? } ?>><?=$i?></option>
			<? } ?>
		</select>
		<? if ($controller->getTask() == 'edit') { 
			// we need this to actually go through the form in edit mode, for layout presets to be saveable in edit mode. ?>
			<input type="hidden" name="themeGridColumns" value="<?=$columnsNum?>" />
		<? } ?>
	</li>
	<li data-grid-form-view="custom" class="ccm-sub-toolbar-text-cell">
		<label for="columns"><?=t("Columns")?></label>
		<select name="columns" id="columns">
			<? for ($i = $minColumns; $i <= $maxColumns; $i++) { ?>
				<option value="<?=$i?>" <? if ($columnsNum == $i) { ?> selected <? } ?>><?=$i?></option>
			<? } ?>
		</select>
		<? if ($controller->getTask() == 'edit') { 
			// we need this to actually go through the form in edit mode, for layout presets to be saveable in edit mode. ?>
			<input type="hidden" name="columns" value="<?=$columnsNum?>" />
		<? } ?>
	</li>
	<li data-grid-form-view="custom" class="ccm-sub-toolbar-separator"></li>
	<li data-grid-form-view="custom" class="ccm-sub-toolbar-text-cell">
		<label for="columns"><?=t("Spacing")?></label>
		<input name="spacing" id="spacing" type="text" style="width: 20px" value="<?=$spacing?>" />
	</li>
	<li data-grid-form-view="custom" class="ccm-sub-toolbar-separator"></li>
	<li data-grid-form-view="custom" class="ccm-sub-toolbar-text-cell">
		<label><?=t("Automatic Widths")?></label>
		<input type="checkbox" value="1" name="isautomated" <? if (!$iscustom) { ?>checked="checked" <? } ?> />
	</li>

	<li class="ccm-layouts-toolbar-save">
		<button id="ccm-layouts-cancel-button" type="button" class="btn btn-mini"><?=t("Cancel")?></button>
		<?
		$pk = PermissionKey::getByHandle('manage_layout_presets');
		if (!$pk->validate()) { ?>
		  <button class="btn btn-primary btn-mini" type="button" id="ccm-layouts-save-button"><? if ($controller->getTask() == 'add') { ?><?=t('Add Layout')?><? } else { ?><?=t('Update Layout')?><? } ?></button>
		<? } else { ?>
		<div class="btn-group" id="ccm-layouts-save-button-group">
		  <button class="btn btn-primary btn-mini" type="button" id="ccm-layouts-save-button"><? if ($controller->getTask() == 'add') { ?><?=t('Add Layout')?><? } else { ?><?=t('Update Layout')?><? } ?></button>
		  <a class="btn btn-primary btn-mini dropdown-toggle" data-toggle="dropdown" href="#"><span class="caret"></span></a>
		  <ul class="dropdown-menu pull-right">
		    <li><a href="javascript:void(0)" onclick="CCMLayout.launchPresets('#ccm-layouts-edit-mode', '<?=Loader::helper('validation/token')->generate('layout_presets')?>')"><i class="icon-pencil"></i> <?=t("Save Settings as Preset")?></a></li>
		  </ul>
		</div>
		<? } ?>
	</li>

	<? if ($controller->getTask() == 'add') { ?>
		<input name="arLayoutMaxColumns" type="hidden" value="<?=$controller->getAreaObject()->getAreaGridColumnSpan()?>" />
	<? } ?>
</ul>

<script type="text/javascript">
<? 

if ($controller->getTask() == 'edit') {
	$editing = 'true';
} else {
	$editing = 'false';
}

if ($enableThemeGrid && $controller->getTask() == 'add') {
	$formview = 'choosetype';
} else if ($enableThemeGrid) {
	$formview = 'themegrid';
} else {
	$formview = 'custom';
}



?>

$(function() {
	$('#ccm-layouts-edit-mode').ccmlayout({
		'editing': <?=$editing?>,
		'formview': '<?=$formview?>',
		<? if ($enableThemeGrid) { ?>
		'rowstart':  '<?=addslashes($themeGridFramework->getPageThemeGridFrameworkRowStartHTML())?>',
		'rowend': '<?=addslashes($themeGridFramework->getPageThemeGridFrameworkRowEndHTML())?>',
		<? if ($controller->getTask() == 'add') { ?>
		'maxcolumns': '<?=$controller->getAreaObject()->getAreaGridColumnSpan()?>',
		<? } else { ?>
		'maxcolumns': '<?=$themeGridMaxColumns?>',
		<? } ?>
		'gridColumnClasses': [
			<? $classes = $themeGridFramework->getPageThemeGridFrameworkColumnClasses();?>
			<? for ($i = 0; $i < count($classes); $i++) { 
				$class = $classes[$i];?>
				'<?=$class?>' <? if (($i + 1) < count($classes)) { ?>, <? } ?>

			<? } ?>
		]
		<? } ?>
	});
});


</script>

<div id="ccm-area-layout-active-control-bar" class="ccm-area-layout-control-bar ccm-area-layout-control-bar-<?=$controller->getTask()?>"></div>