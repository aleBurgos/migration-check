import "babel-polyfill";
import { CLUSTERS } from './constants';
import ES from './es-queries';
import DB from './mongo-queries';

const checks = ['meetings','users', 'messages','leads'];

const checkCluster = async (cluster, {excludeDeleted, excludeNoMigrated})=>{
	console.log('\n \n checking cluster... ', cluster.name);
	console.log('\n')
	const es =  ES(cluster);
    const db = await DB(cluster);
	const syncedCommunityIds = await es.syncedCommunityIds();
	const migratedCommunityIds = await db.migratedCommunityIds();
	const syncAndMigratedCommunities = new Set([...syncedCommunityIds, ...migratedCommunityIds]);
	const allCommmunities = await db.allCommunitiesIds();

	checks.forEach(async(checkKey)=>{
		const totalsDbMap = await db[checkKey]();
		const totalEsMap = await es[checkKey]();
		console.log(`\n${checkKey} Totals -> Db:${totalsDbMap.total}, ES: ${totalEsMap.total} \n`);

		let okCount = 0;

		syncAndMigratedCommunities.forEach((communityId)=>{

			const deleted = !allCommmunities.includes(communityId);
			const migrated = migratedCommunityIds.includes(communityId);
			const dbTotal = totalsDbMap.byCommunity[communityId]|| -1;
			const esTotal = totalEsMap.byCommunity[communityId] || -1;

			if(excludeDeleted && deleted) return;
			if(excludeNoMigrated && !migrated) return;
			if(migrated && dbTotal == esTotal){
				okCount++;
			}

			console.log(`${checkKey} ~ communityId: ${communityId} ${migrated?'(M)':'   '} -> Db: ${dbTotal}, ES: ${esTotal}  ${deleted ? '(communnity deleted)':''}            ${esTotal == dbTotal? 'OK': 'DIFFERENTS'}`)
		});
		console.log(`\n${checkKey} % migrated correctly -> ${(okCount*100/migratedCommunityIds.length).toFixed(2)}% \n`);
	});
}


checkCluster(CLUSTERS.EU1, {excludeDeleted: true, excludeNoMigrated: true});
