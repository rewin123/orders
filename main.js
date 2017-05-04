global.OrderDelay = function() {
    for(var i in Memory.orders)
    {
        if(Memory.orders[i].active == false)
        {
            return Game.time - Memory.orders[i].time;
        }
    }
    return 0;
}

global.RequstEnergy = function(orderName, owner, step) {
    var request = 0;
    for(var j in Memory.orders)
    {
        var order = Memory.orders[j];
        if(order.name === orderName)
        {
            if(order.owner === owner)
            {
                request += step;
            }
        }
    }
    return request;
}

global.RemoveInactive = function(orderName,owner) {
    for(var j in Memory.orders)
    {
        var order = Memory.orders[j];
        if(order.name === orderName)
        {
            if(order.owner === owner)
            {
                if(order.active == false)
                {
                    Memory.orders.splice(j,1);
                    return '';
                }
            }
        }
    }
}

global.RemoveAllInactive = function()
{
    for(var j in Memory.orders)
    {
        var order = Memory.orders[j];
        if(order.active == false)
        {
            Memory.orders.splice(j,1);
            j--;
        }
    }
}

global.GetUnbusySpawn = function(room,pos)
{
    var sources = room.find(FIND_SOURCES_ACTIVE);
    var bestDist = 100000;
    var bestSource = null;
    for(var i in sources)
    {
        if(Memory.sources[sources[i].id].busy < 20)
        {
            var dist = sources[i].pos.getRangeTo(pos);
            if(dist < bestDist)
            {
                bestSource = sources[i];
                bestDist = dist;
            }
        }
    }
    if(bestSource != null)
        return bestSource;
    else
    {
        console.log('all busy');
        return pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    }
}

global.RemoveBusy = function(room,x,y,busy)
{
    var objs = room.lookAt(x,y);
    for(var k in objs)
    {
        if(objs[k].type === 'source')
        {
            Memory.sources[objs[k].source.id].busy -= busy;
            break;
        }
    }
    return 0;
}


console.log(Memory.sources['ef990774d80108c'].busy);
//добавим busy(нагруженность) соурсам
for(var i in Game.rooms)
{
    var room = Game.rooms[i];
    var sources = room.find(FIND_SOURCES);
    for(var j in sources)
    {
        if(Memory.sources[sources[j].id] === undefined)
        {
            Memory.sources[sources[j].id] = {
                busy : 0,
                roomName : room.name
            }
        }
    }
}
//осовобождаем приказы приписанные к мертвым
for(var i in Memory.orders)
{
    if(Memory.orders[i].active)
    {
        if(Game.creeps[Memory.orders[i].worker] == undefined)
        {
            Memory.orders[i].active = false;
            console.log('exit from death');
        }
    }
}
//уничтожаем мертвых крипов
for(var key in Memory.creeps)
{
    if(Game.creeps[key] === undefined)
    {
        if(Memory.creeps[key].order != null)
        {
            for(var j in Memory.orders)
            {
                
                if(Memory.orders[j].id == Memory.creeps[key].order.id)
                {
                    console.log()
                    Memory.orders[j].active = false;
                    break;
                }
            }
            if(Memory.creeps[key].order.actions.length > 0)
            {
                if(Memory.creeps[key].order.actions[0].a === 'harvest')
                {
                    var pos = Memory.creeps[key].order.actions[0].pos;
                    
                    RemoveBusy(Game.rooms[pos.roomName],pos.x,pos.y,Memory.creeps[key].busyAdd);
                }
            }
        }
        delete Memory.creeps[key];
        console.log('remove ' + key);
    }
}

var minerBody = [CARRY, WORK, MOVE, MOVE];
var minerScript = require('MinerMove');
if(Memory.indexer == undefined)
{
    Memory.indexer = 0;
    Memory.orders = new Array();
}

if(Memory.orders == undefined)
{
    Memory.orders = new Array();
}
console.log(Memory.orders.length);
if(Memory.orders.length > 0)
{
    console.log('Простой ' + OrderDelay());
}

//приказы на стройку
/*for(var i in Game.rooms)
{
    var room = Game.rooms[i];
    var sites = room.find(FIND_CONSTRUCTION_SITES);
    var request = RequstEnergy('build',room.name,1);
    if(request < 10)
    {
        for(var j in sites)
        {
            if(Memory.csites[sites[j].id] == undefined)
            {
                Memory.csites[sites[j].id] = 1;
                
                var site = sites[j];
                
                Memory.indexer += 1;
                
                var source = GetUnbusySpawn(site.room,site.pos);
                //make order to harvest
                var order = {
                roomName : site.room.name,
                time : Game.time,
                name : 'build',
                owner : site.room.name,
                target : site.id,
                active : false,
                index : Memory.indexer,
                worker : '',
                
                actions : new Array()
                }
                
                var act = 
                {
                    a : 'harvest',
                    pos : source.pos
                }
                
                order.actions.push(act);
                
                act = 
                {
                    a : 'build',
                    pos : site.pos
                }
                
                order.actions.push(act);
                
                Memory.orders.push(order);
                
                if(Memory.orders[0] == null)
                {
                    console.log('shift');
                    Memory.orders.shift();
                }
            }
        }
    }
}*/

//пополняем спавны
for(var i in Game.spawns)
{
    var spawn = Game.spawns[i];
    var need = spawn.energyCapacity - spawn.energy;
    var request = 0;
    for(var j in Memory.orders)
    {
        
        var order = Memory.orders[j];
        if(order.name === 'collect energy')
        {
            if(order.owner === spawn.id)
            {
                request += CARRY_CAPACITY;
            }
        }
    }
    if(spawn.energy < spawn.energyCapacity)
    {
        
        if(request < need)
        {
            Memory.indexer += 1;
            var source = GetUnbusySpawn(spawn.room,spawn.pos);
            //make order to harvest
            var order = {
            roomName : spawn.room.name,
            time : Game.time,
            name : 'collect energy',
            owner : spawn.id,
            target : source.id,
            active : false,
            index : Memory.indexer,
            worker : '',
            
            actions : new Array()
            }
            
            var act = 
            {
                a : 'harvest',
                pos : source.pos
            }
            
            order.actions.push(act);
            
            act = 
            {
                a : 'transfer',
                pos : spawn.pos
            }
            
            order.actions.push(act);
            
            Memory.orders.unshift(order);
            
            if(Memory.orders[0] == null)
            {
                console.log('shift');
                Memory.orders.shift();
            }
        }
        
    }
    if(request - CARRY_CAPACITY > need)
    {
        console.log('remove mass');
        for(var j in Memory.orders)
        {
            var order = Memory.orders[j];
            if(order.name === 'collect energy')
            {
                if(order.owner === spawn.id)
                {
                    if(order.active == false)
                    {
                        Memory.orders.splice(j,1);
                        break;
                    }
                }
            }
        }
    }
}


//улучшаем контроллер комнаты
for(var i in Game.rooms)
{
    var controller = Game.rooms[i].controller;
    
    var request = RequstEnergy('upgrade',controller.room.name,CARRY_CAPACITY);
    console.log(request/CARRY_CAPACITY);
    if(request < (controller.progressTotal - controller.progress) && request/CARRY_CAPACITY < 40)
    {
        
        Memory.indexer += 1;
        //make order to harvest
        var order = {
            roomName : controller.room.name,
            time : Game.time,
            name : 'upgrade',
            owner : controller.room.name,
            target : controller.id,
            active : false,
            index : Memory.indexer,
            worker : '',
        
            actions : new Array()
        }
        
        var act = 
        {
            a : 'harvest',
            pos : GetUnbusySpawn(controller.room,controller.pos).pos
        }
        
        order.actions.push(act);
        
        act = 
        {
            a : 'upgradeController',
            pos : controller.pos
        }
        
        order.actions.push(act);
        
        Memory.orders.push(order);
        
        if(Memory.orders[0] == null)
        {
            console.log('shift');
            Memory.orders.shift();
        }
    }
    else if(request - (controller.progressTotal - controller.progress) > CARRY_CAPACITY)
    {
        RemoveInactive('upgrade',controller.room.name);
    }
    
}

if(Memory.orders.length > 0)
{
    if(OrderDelay() > 100)
    {
        var spawn = Game.rooms[Memory.orders[0].roomName].find(FIND_MY_SPAWNS)[0];
        spawn.createCreep(minerBody, null, {role : 'miner', order : null, shifted : true, busyAdd : 0});
    }
}

for(var i in Game.creeps)
{
    var creep = Game.creeps[i];
    if(creep.memory.role === 'miner')
    {
        minerScript.run(creep);
    }
}