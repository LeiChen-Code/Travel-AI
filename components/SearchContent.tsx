import React from 'react'
import { Search } from "lucide-react";
import { Input } from './ui/input';


// 搜索框
const SearchContent = () => {
  return (
    <div className="relative ml-auto flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
        <Input 
            type="search" 
            placeholder="搜索行程"
            className="w-full cursor-pointer bg-background pl-8 transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
        />
    </div>
  )
}

export default SearchContent