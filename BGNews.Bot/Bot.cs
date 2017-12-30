using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;

using Parse;

namespace BGNewsBot
{
    public class Bot
    {
        private static const string IDS_FILE = "../../ids.txt";

        private static List<string> ids = GetOldIds();
        private static Dictionary<string, ParseObject> posts = new Dictionary<string, ParseObject>();
        private static Dictionary<string, ParseObject> tags = new Dictionary<string, ParseObject>();
        private static Dictionary<string, ParseObject> categories = new Dictionary<string, ParseObject>();
        private static ParseUser currentUser;

        [STAThread]
        public static void Main()
        {
            ParseClient.Initialize("U3XywIHqzfU4KD8FEV57PRmMZPpmuDOwflN6itSy", "CJ7X7c3CIcoA1D6pLGXa6tIA6xkmT6evgfl8A9S4");
            Console.WriteLine("Get post and tags from Parse.com...");

            Task.Run(() => Login("bot", "bot")).Wait();
            Task.Run(() => GetParseObject(categories, "Category", "name")).Wait();
            Task.Run(() => GetParseObject(tags, "Tag", "name")).Wait();
            Task.Run(() => GetParseObject(posts, "Post", "title")).Wait();
            Task.Run(() => ScanForNewPosts()).Wait();
        }

        private static async Task Login(string username, string password)
        {
            await Task.Delay(1000);
            await ParseUser.LogInAsync(username, password);
            await Task.Delay(1000);
            currentUser = ParseUser.CurrentUser;
        }

        private static async Task GetParseObject(Dictionary<string, ParseObject> list, string className, string parameter, int count = 0, int limit = 1000)
        {
            if (count * limit != list.Count) return;
            var result = await ParseObject.GetQuery(className).Limit(limit).Skip(list.Count).FindAsync();
            result.ToList().ForEach(x => list.Add(x.Get<string>(parameter), x));
            await GetParseObject(list, className, parameter, ++count);
        }

        private static async Task ScanForNewPosts()
        {
            var rssIds = new int[] {
                154, 153, 152, 151, 150, 149, 81, 30, 28, 62, 34, 26, 25, 24,
                23, 22, 21, 20, 19, 18, 17, 16, 15, 10, 6, 5, 4, 3, 2, 1, 0 
            };

            while (true)
            {
                foreach (var id in rssIds)
                {
                    while (true)
                    {
                        try
                        {
                            var rssPosts = await GetRssPosts(id);
                            rssPosts.ForEach(x => Task.Run(() => ProcessPost(x)).Wait());
                            break;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                    }
                }

                Console.WriteLine("\nExport all post ids...");
                using (var writer = new StreamWriter(IDS_FILE, false))
                {
                    ids.ToList().ForEach(line => writer.WriteLine(line));
                }

                await Sleep(180);
                Console.WriteLine();
            }
        }

        private static async Task ProcessPost(Post post)
        {
            Console.WriteLine("\nPost: " + post.Title);
            await Task.Delay(5000);
            var postTags = await GetTags(post.Link);
            if (postTags.Count > 0)
            {
                postTags = postTags.OrderBy(x => x).ToList();
                postTags.ForEach(async t =>
                {
                    if (!tags.ContainsKey(t))
                    {
                        Task.Run(() => AddTag(t)).Wait();
                        await Task.Delay(1000);
                        Console.WriteLine("A new tag was created: " + t);
                    }
                });

                Console.WriteLine(postTags.Count + " tags were found in the post.");
                postTags.ForEach(x => post.Tags.Add(tags[x]));
            }
            else Console.WriteLine("Post without tags!");

            posts.Add(post.Title, new ParseObject("Post"));
            Task.Run(() => AddPost(post)).Wait();
        }

        private static async Task<List<string>> GetTags(string url)
        {
            using (var webResponse = (HttpWebResponse)WebRequest.Create(url).GetResponse())
            {
                using (var reader = new StreamReader(webResponse.GetResponseStream()))
                {
                    await Task.Delay(1000);
                    var response = reader.ReadToEnd();
                    response = string.Join("", response.Split('\n'));
                    var match = Regex.Match(response, @"<div id=""article_tags"">(.*)</div>");
                    if (match.Success)
                    {
                        var text = match.Groups[1].Value;
                        var endINdex = text.IndexOf("</div>");
                        if (endINdex >= 0) text = text.Substring(0, endINdex);
                        var matches = Regex.Matches(text, @"<a[^>]+>([^<]+)</a>");
                        if (matches.Count > 0)
                        {
                            return matches.Cast<Match>().Select(x =>
                            {
                                var tag = Regex.Replace(x.Groups[1].Value.Trim(), @"(^\.|^,|\.$|,$)", "").Trim().ToLower();
                                while (tag.Contains("  ")) tag = tag.Replace("  ", " ");

                                if (tag.Length > 50)
                                {
                                    Console.Beep(500, 1000);
                                    Console.WriteLine("Too long tag: " + tag + "\nPress [Enter] to continue...");
                                    Console.ReadLine();
                                }

                                return tag;
                            }).Where(x => !string.IsNullOrEmpty(x)).ToList();
                        }
                    }

                    return new List<string>();
                }
            }
        }

        private static async Task AddTag(string tag)
        {
            var parseTag = new ParseObject("Tag");
            parseTag["name"] = tag;

            tags.Add(tag, parseTag);

            await parseTag.SaveAsync();
            await Task.Delay(1000);
        }

        private static async Task AddPost(Post post)
        {
            var parsePost = new ParseObject("Post");
            parsePost["title"] = post.Title;
            parsePost["category"] = post.Category;
            parsePost["image"] = post.Image;
            parsePost["content"] = post.Content;
            parsePost["tags"] = post.Tags;
            parsePost["user"] = currentUser;
            await parsePost.SaveAsync();
            await Task.Delay(1000);
            Console.WriteLine("A new post was created in category " + post.Category.Get<string>("name"));
        }

        private static async Task Sleep(int timeInSeconds)
        {
            Console.Write("Sleep for {0} seconds", timeInSeconds);
            for (int i = 0; i < timeInSeconds; i++)
            {
                Console.Write(".");
                await Task.Delay(1000);
            }

            Console.WriteLine();
        }

        private static async Task<List<Post>> GetRssPosts(int id = 0)
        {
            Console.WriteLine("\nScanning for new posts (" + (id == 0 ? "global" : "category " + id) + ")...");
            var url = "http://www.novinite.com/services/news_rdf.php" + (id == 0 ? "" : "?category_id=" + id);
            using (var webResponse = (HttpWebResponse)WebRequest.Create(url).GetResponse())
            {
                using (var reader = new StreamReader(webResponse.GetResponseStream()))
                {
                    var xElement = XElement.Parse(reader.ReadToEnd());
                    var data = xElement.Descendants("item").Select(x =>
                    {
                        var cat = x.Element("category").Value.Trim()
                            .Replace("Business", "Finance")
                            .Replace("Politics", "Diplomacy")
                            .Replace("World", "International Business")
                            .Replace("Lifestyle", "Culture")
                            .Replace("Views on BG", "Culture")
                            .Replace("Archaeology", "Culture")
                            .Replace("Opinions", "Culture")
                            .Replace("Obituaries", "Culture")
                            .Replace("Society", "Culture");

                        if (categories.ContainsKey(cat))
                        {
                            return new Post(
                                x.Element("title").Value.Trim(), categories[cat], x.Element("enclosure").Attribute("url").Value.Trim(),
                                Regex.Replace(x.Element("description").Value.Trim(), @"(<img [^>]*>|style=""[^""]*"")", ""),
                                x.Element("guid").Value.Trim(), x.Element("link").Value.Trim());
                        }
                        else return null;
                    }).Where(x => x != null && !ids.Contains(x.Guid) && !posts.ContainsKey(x.Title)).ToList();

                    data.ForEach(x => ids.Add(x.Guid));
                    data.Reverse();

                    Console.WriteLine((data.Count > 0 ? data.Count + " post" + (data.Count == 1 ? "" : "s") : "No posts") + " was found");
                    await Task.Delay(1000);

                    return data;
                }
            }
        }

        private static List<string> GetOldIds()
        {
            var result = new List<string>();
            using (var reader = new StreamReader(IDS_FILE))
            {
                string line = reader.ReadLine();
                while (line != null)
                {
                    result.Add(line);
                    line = reader.ReadLine();
                }
            }

            return result;
        }
    }
}
