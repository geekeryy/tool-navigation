deploy-guide:
	pushd guide; firebase deploy --only hosting:tools-nav;popd

deploy-snake:
	pushd snake_game; firebase deploy --only hosting:snake-game-ai;popd

preview-guide: 
	pushd guide; firebase hosting:channel:deploy $(shell date "+%Y_%m_%d-%H:%M:%S");popd

preview-snake: 
	pushd snake_game; firebase hosting:channel:deploy $(shell date "+%Y_%m_%d-%H:%M:%S");popd