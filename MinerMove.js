/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('MinerMove');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(creep)
    {
        if(creep.memory.order === null)
        {
            for(var i in Memory.orders)
            {
                var order = Memory.orders[i];
                if(order.roomName === creep.room.name)
                {
                    if(order.active == false)
                    {
                        creep.memory.order = order;
                        Memory.orders[i].active = true;
                        Memory.orders[i].worker = creep.name;
                        break;
                    }
                }
            }
        }
        
        if(creep.memory.order != null)
        {
            if(creep.memory.order.actions.length != 0)
            {
                var action = creep.memory.order.actions[0];
                var pos = new RoomPosition(action.pos.x,action.pos.y,action.pos.roomName);
                
                if(pos.roomName === creep.room.name)
                {
                    if(action.a == 'harvest')
                    {
                        if(creep.memory.shifted == true)
                        {
                            console.log('shifted');
                            pos = GetUnbusySpawn(creep.room,creep.pos).pos;
                            creep.memory.order.actions[0].pos = pos;
                            
                            var objs = creep.room.lookAt(pos);
                            for(var k in objs)
                            {
                                if(objs[k].type === 'source')
                                {
                                    creep.memory.busyAdd = 25.0/PathFinder.search(creep.pos,pos).path.length;
                                    Memory.sources[objs[k].source.id].busy += creep.memory.busyAdd;
                                    break;
                                }
                            }
                        }
                        creep.memory.shifted = false;
                        if(pos.getRangeTo(creep.pos) < 2)
                        {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES);
                            creep.harvest(source);
                            if(_.sum(creep.carry) == creep.carryCapacity)
                            {
                                creep.memory.order.actions.shift();
                                creep.memory.shifted = true;
                                var objs = creep.room.lookAt(pos);
                                for(var k in objs)
                                {
                                    if(objs[k].type === 'source')
                                    {
                                        Memory.sources[objs[k].source.id].busy -= creep.memory.busyAdd;
                                        break;
                                    }
                                }
                            }
                        }
                        else
                        {
                            creep.moveTo(pos);
                            
                        }
                    }
                    else if(action.a == 'transfer')
                    {
                        creep.memory.shifted = false;
                        if(pos.getRangeTo(creep.pos) < 2)
                        {
                            var source = creep.pos.findClosestByRange(FIND_MY_STRUCTURES);
                            var err = creep.transfer(source,RESOURCE_ENERGY);
                            if(_.sum(creep.carry) == 0 || err == ERR_FULL)
                            {
                                creep.memory.order.actions.shift();
                                creep.memory.shifted = true;
                            }
                        }
                        else
                        {
                            creep.moveTo(pos);
                        }
                    }
                    else if(action.a == 'upgradeController')
                    {
                        creep.memory.shifted = false;
                        if(pos.getRangeTo(creep.pos) < 4)
                        {
                            var source = creep.room.controller;
                            creep.upgradeController(source);
                            if(_.sum(creep.carry) == 0)
                            {
                                creep.memory.order.actions.shift();
                                creep.memory.shifted = true;
                            }
                        }
                        else
                        {
                            creep.moveTo(pos);
                        }
                    }
                    else if(action.a == 'build')
                    {
                        if(pos.getRangeTo(creep.pos) < 3)
                        {
                            var source = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                            var res = creep.build(source);
                            if(res == OK || res == ERR_RCL_NOT_ENOUGH || res == ERR_INVALID_TARGET || res == ERR_NOT_IN_RANGE)
                            {
                                creep.memory.order.actions.shift();
                                creep.memory.shifted = true;
                            }
                        }
                        else
                        {
                            creep.moveTo(pos);
                        }
                    }
                }
                else
                {
                    creep.moveTo(pos);
                }
                
            }
            else
            {
                for(var j in Memory.orders)
                {
                    if(Memory.orders[j].index === creep.memory.order.index)
                    {
                        Memory.orders.splice(j,1);
                    }
                }
                creep.memory.order = null;
            }
        }
    }
};