module.exports=async function dismissLaunch(page){
 const start=page.locator('#launchScreen .launch-start');
 if(await start.count()){await start.click();await page.waitForSelector('#launchScreen',{state:'detached'});
  const guest=page.locator('[data-profile="guest"]');if(await guest.count())await guest.click();}
};
