using System.Collections.Generic;

using Parse;

namespace BGNewsBot
{
    public class Post
    {
        public Post(string title, ParseObject category, string image, string content, string guid, string link)
        {
            this.Tags = new List<ParseObject>();

            this.Title = title;
            this.Category = category;
            this.Image = image;
            this.Content = content;
            this.Guid = guid;
            this.Link = link;
        }

        public string Title { get; private set; }

        public ParseObject Category { get; private set; }

        public string Image { get; private set; }

        public string Content { get; private set; }

        public string Guid { get; private set; }

        public string Link { get; private set; }

        public List<ParseObject> Tags { get; set; }
    }
}
