import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import ParseArgs from "../util/parseArgs";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class MealCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'meal',
      [ 'food',
        'whatshallieat',
        'makemefood',
        'eat' ],
      'A random meal and how to make it',
      2,
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    let cmdl = ParseArgs.parse(args);
    let url = 'https://www.themealdb.com/api/json/v1/1/random.php';
    let search = '';
    if (cmdl._) {
      search = cmdl._ + '';
      url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search);
    }
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(o => o.json())
        .then(o => {
          if (!o || !o.meals || !o.meals.length) {
            console.log(url)
            if (search) repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
            else repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
            reject();
            return;
          }
          let meal = o.meals[0];

          if (cmdl.r || cmdl.raw) {
            repl('```json\n' + JSON.stringify(meal, null, 2) + '```');
            reject();
            return;
          }

          let ingredients = [];
          let i = 1;
          while (meal['strIngredient' + i]) {
            ingredients.push(`${meal['strMeasure' + i]} **${meal['strIngredient' + i]}**`);
            i++;
          }
          channel.send({
            embed: {
              color: 0x2f3136,
              title: meal.strMeal,
              thumbnail: {
                url: meal.strMealThumb
              },
              fields: [
                {
                  name: 'Category',
                  value: meal.strCategory,
                  inline: true
                },
                {
                  name: 'Area',
                  value: meal.strArea,
                  inline: true
                },
                {
                  name: 'Ingredients',
                  value: ingredients.join('\n')
                },
                {
                  name: 'Instructions',
                  value: meal.strInstructions
                }
              ],
              footer: {
                text: '@' + user.username + ' • powered by thecocktaildb.com'
              }
            }
          });
          resolve(true);
        })
        .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
