"use client";

import { useState } from "react";
import {
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── 1. Basic Dropdown Menu ─────────────────────────────────

export const DropdownMenuBasicDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-test-id="dropdown-basic-trigger">
          Open Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem data-test-id="dropdown-basic-profile">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem data-test-id="dropdown-basic-billing">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem data-test-id="dropdown-basic-settings">
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem data-test-id="dropdown-basic-team">
            Team
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem data-test-id="dropdown-basic-invite-email">
                Email
              </DropdownMenuItem>
              <DropdownMenuItem data-test-id="dropdown-basic-invite-message">
                Message
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-test-id="dropdown-basic-logout">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── 2. Chat List Dropdown ──────────────────────────────────

const chatListItems = [
  {
    fallback: "PG",
    name: "Phillip George",
    message: "Hii samira, thanks for the...",
    time: "9:00AM",
    newMessages: 1,
  },
  {
    fallback: "JD",
    name: "Jaylon Donin",
    message: "I'll send the texts and...",
    time: "10:00PM",
    newMessages: 3,
  },
  {
    fallback: "TC",
    name: "Tiana Curtis",
    message: "That's Great!",
    time: "8:30AM",
    newMessages: null,
  },
  {
    fallback: "ZV",
    name: "Zaire Vetrovs",
    message: "https://www.youtub...",
    time: "5:50AM",
    newMessages: 2,
  },
  {
    fallback: "KP",
    name: "Kianna Philips",
    message: "Okay, It was awesome.",
    time: "6.45PM",
    newMessages: null,
  },
];

export const DropdownMenuChatListDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-test-id="dropdown-chat-trigger">
          Chat List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-91">
        <DropdownMenuLabel>Chat List</DropdownMenuLabel>
        <DropdownMenuGroup>
          {chatListItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="justify-between py-3"
              data-test-id={`dropdown-chat-item-${index}`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="text-xs">
                    {item.fallback}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-muted-foreground text-xs line-clamp-1">
                    {item.message}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-muted-foreground text-[10px] uppercase font-medium">
                  {item.time}
                </span>
                {item.newMessages && (
                  <Badge className="h-5 min-w-5 flex items-center justify-center bg-green-600 px-1 text-[10px] text-white hover:bg-green-700 dark:bg-green-500">
                    {item.newMessages}
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── 3. Checkbox Dropdown ───────────────────────────────────

export const DropdownMenuCheckboxDemo = () => {
  const [showStatus, setShowStatus] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-test-id="dropdown-checkbox-trigger">
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatus}
          onCheckedChange={setShowStatus}
          data-test-id="dropdown-checkbox-status"
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivity}
          onCheckedChange={setShowActivity}
          data-test-id="dropdown-checkbox-activity"
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
          data-test-id="dropdown-checkbox-panel"
        >
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── 4. User Switcher Dropdown ──────────────────────────────

const switcherUsers = [
  { id: 1, fallback: "PG", name: "Phillip George", mail: "phillip12@gmail.com" },
  { id: 2, fallback: "JD", name: "Jaylon Donin", mail: "jaylo-don@yahoo.com" },
  { id: 3, fallback: "TC", name: "Tiana Curtis", mail: "Tiana_curtis@gmail.com" },
];

export const DropdownMenuUserSwitcherDemo = () => {
  const [selectUser, setSelectUser] = useState(switcherUsers[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2.5 outline-none"
        data-test-id="dropdown-switcher-trigger"
      >
        <Avatar>
          <AvatarFallback className="text-xs">{selectUser.fallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-start leading-none">
          <span className="max-w-[17ch] truncate text-sm leading-none font-semibold">
            {selectUser.name}
          </span>
          <span className="text-muted-foreground max-w-[20ch] truncate text-xs">
            {selectUser.mail}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-66">
        <DropdownMenuLabel>Task Assignment</DropdownMenuLabel>
        {switcherUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => setSelectUser(user)}
            data-test-id={`dropdown-switcher-user-${user.id}`}
          >
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="text-xs">{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 text-start leading-none">
                <span className="max-w-[17ch] truncate text-sm leading-none font-semibold">
                  {user.name}
                </span>
                <span className="text-muted-foreground max-w-[20ch] truncate text-xs">
                  {user.mail}
                </span>
              </div>
            </div>
            {selectUser.id === user.id && <CheckIcon className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── 5. User Profile Dropdown ───────────────────────────────

const userMenuItems = [
  { icon: UserIcon, property: "Profile" },
  { icon: SettingsIcon, property: "Settings" },
  { icon: CreditCardIcon, property: "Billing" },
  { icon: BellIcon, property: "Notifications" },
  { icon: LogOutIcon, property: "Sign Out" },
];

export const DropdownMenuUserDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="overflow-hidden rounded-full"
          data-test-id="dropdown-user-trigger"
        >
          <AvatarImage src="" alt="User" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          {userMenuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              data-test-id={`dropdown-user-${item.property.toLowerCase().replace(" ", "-")}`}
            >
              <item.icon className="size-4" />
              <span className="text-popover-foreground">{item.property}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
