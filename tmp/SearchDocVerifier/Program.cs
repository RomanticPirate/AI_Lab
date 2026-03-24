using System.Reflection;
using DocumentExplorerApp;

Console.OutputEncoding = System.Text.Encoding.UTF8;
var asm = typeof(MainForm).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Console.WriteLine(name);
}
