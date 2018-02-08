'use strict';


module.exports = function (oAppData) {
	var
		Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
		
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
		
		bAnonimUser = App.getUserRole() === Enums.UserRole.Anonymous
	;
	
	if (!ModulesManager.isModuleAvailable('CoreMobileWebclient'))
	{
		return null;
	}
	
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
				
				if (Types.isNonEmptyString(sHashModuleName))
				{
					oScreens[sHashModuleName] = function () {
						var oLoginScreenView = ModulesManager.run('StandardLoginFormWebclient', 'getLoginScreenView');
						if (oLoginScreenView)
						{
							oLoginScreenView.ViewTemplate = '%ModuleName%_LoginView';
						}
						return oLoginScreenView;
					};
				}
				
				return oScreens;
			}
		};
	}
	
	return null;
};
