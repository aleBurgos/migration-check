import "babel-polyfill";
import { CLUSTERS } from './constants';
import ES from './es-queries';
import DB from './mongo-queries';

const checks = ['meetings','users', 'messages','leads'];

const checkCluster = async (cluster, {excludeDeleted, excludeNoMigrated})=>{

	const es =  ES(cluster);
    const db = await DB(cluster);
	const syncedCommunityIds = await es.syncedCommunityIds();
	const migratedCommunityIds = await db.migratedCommunityIds();
	const syncAndMigratedCommunities = new Set([...syncedCommunityIds, ...migratedCommunityIds]);
	const allCommmunities = await db.allCommunitiesIds();
	console.log('\n \n checking cluster... ', cluster.name);
	console.log('\n')
	checks.reduce(async(acc,checkKey)=>{
		await acc;
		const totalsDbMap = await db[checkKey]();
		const totalEsMap = await es[checkKey]();
		console.log(`\n(${cluster.name})${checkKey} Totals -> Db:${totalsDbMap.total}, ES: ${totalEsMap.total} \n`);

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

			console.log(`(${cluster.name}) ${checkKey} ~ communityId: ${communityId} ${migrated?'(M)':'   '} -> Db: ${dbTotal}, ES: ${esTotal}  ${deleted ? '(communnity deleted)':''}            ${esTotal == dbTotal? 'OK': 'DIFFERENTS'}`)
		});
		console.log(`\n(${cluster.name}) ${checkKey} % migrated correctly -> ${(okCount*100/migratedCommunityIds.length).toFixed(2)}% \n`);
		return;
	}, undefined);
}



const checkAll = async ()=>{
	// force secuential execution
	await Object.values(CLUSTERS).reduce(async (acc,cluster)=>{
		await acc;
		await checkCluster(cluster, {excludeDeleted: true, excludeNoMigrated: true});
		return;
	}, undefined);


}

checkAll().then(()=>console.log('Fin'));

// checkCluster(CLUSTERS.US1, {excludeDeleted: true, excludeNoMigrated: true});
