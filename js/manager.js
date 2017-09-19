'use strict';

module.exports = function (oAppData) {
	var
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
		
		bAnonimUser = App.getUserRole() === Enums.UserRole.Anonymous
	;
	
	if (!ModulesManager.isModuleAvailable('CoreMobileWebclient'))
	{
		return null;
	}
	
//	var mdc = require('material-components-web');
	var mdcTextfield = require('@material/textfield/dist/mdc.textfield.js');
	require('node_modules/material-components-web/dist/material-components-web.css');
	
	console.log(mdcTextfield);
	
	if (!App.isPublic() && bAnonimUser)
	{
		return {
			/**
			 * Returns login view screen.
			 */
			getScreens: function () {
				var
					oScreens = {},
					ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
					sHashModuleName = ModulesManager.run('StandardLoginFormWebclient', 'getHashModuleName')
				;
				oScreens[sHashModuleName] = function () {
					var 
						oLoginScreenView = ModulesManager.run('StandardLoginFormWebclient', 'getLoginScreenView'),
						mdcTextfield = require('@material/textfield/dist/mdc.textfield.js'),
						mdcRipple = require('@material/ripple/dist/mdc.ripple.js')
					;
					
					oLoginScreenView.ViewTemplate = '%ModuleName%_LoginView';
					oLoginScreenView.onBindCallback = function () {
						mdcTextfield.MDCTextfield.attachTo(document.querySelector('#login-textfield'));
						mdcTextfield.MDCTextfield.attachTo(document.querySelector('#password-textfield'));
						
						mdcRipple.MDCRipple.attachTo(document.querySelector('.mdc-button'));
					};
					
					
					return oLoginScreenView;
				};
				return oScreens;
			}
		};
	}
	
	return null;
};
