import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Send, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'idle';
}

interface OutfitItem {
  id: string;
  name: string;
  image: string;
  addedBy: string;
}

export const CollaborativeOutfitBuilder = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isInSession, setIsInSession] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "You",
      avatar: "/placeholder.svg",
      status: 'active'
    }
  ]);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  const createSession = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
    setIsHost(true);
    setIsInSession(true);
    toast.success(`Session created! Code: ${code}`);
  };

  const joinSession = () => {
    if (!sessionCode) {
      toast.error("Please enter a session code");
      return;
    }
    setIsInSession(true);
    setIsHost(false);
    toast.success("Joined session successfully!");
  };

  const inviteCollaborator = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  const addItemToOutfit = () => {
    toast.info("Open wardrobe to add items");
  };

  return (
    <div className="space-y-6">
      {!isInSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Collaborative Styling
            </CardTitle>
            <CardDescription>
              Create outfits together with friends in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button onClick={createSession} className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Session
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Enter session code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono"
                  maxLength={6}
                />
                <Button onClick={joinSession} className="w-full" variant="outline">
                  Join Existing Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Session */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Active Session
                  </CardTitle>
                  <CardDescription>
                    Session Code: <span className="font-mono font-bold">{sessionCode}</span>
                  </CardDescription>
                </div>
                {isHost && (
                  <Badge variant="secondary">Host</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collaborators */}
              <div>
                <h3 className="font-semibold mb-3">Collaborators ({collaborators.length})</h3>
                <div className="flex flex-wrap gap-3">
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center gap-2 p-2 bg-background-subtle rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collab.avatar} />
                        <AvatarFallback>{collab.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{collab.name}</div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${collab.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs text-text-muted">{collab.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite */}
              {isHost && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Invite Friends</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="friend@example.com"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={inviteCollaborator}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Outfit Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Outfit Items ({outfitItems.length})</h3>
                  <Button onClick={addItemToOutfit} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {outfitItems.length === 0 ? (
                  <div className="text-center py-8 bg-background-subtle rounded-lg">
                    <p className="text-text-muted">No items added yet</p>
                    <p className="text-sm text-text-muted mt-1">Start building your outfit together!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {outfitItems.map((item) => (
                      <div key={item.id} className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-xs opacity-80">Added by {item.addedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Save Outfit
                </Button>
                <Button variant="outline" onClick={() => setIsInSession(false)}>
                  Leave Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
