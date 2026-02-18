import { useQuery } from '@tanstack/react-query'
import { onlineUsersService } from './service'

export const onlineUsersKeys = {
  all: ['online-users'] as const,
  list: () => [...onlineUsersKeys.all, 'list'] as const,
  count: () => [...onlineUsersKeys.all, 'count'] as const,
}

export function useOnlineUsers() {
  return useQuery({
    queryKey: onlineUsersKeys.list(),
    queryFn: () => onlineUsersService.getOnlineUsers(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useOnlineCount() {
  return useQuery({
    queryKey: onlineUsersKeys.count(),
    queryFn: () => onlineUsersService.getOnlineCount(),
    refetchInterval: 10000,
  })
}
