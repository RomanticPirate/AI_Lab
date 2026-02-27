import sys
import pygame

# 초기화
pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("게임 UI 프로토타입")

clock = pygame.time.Clock()

# 색상
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# 간단한 UI 요소 예: 버튼
button_rect = pygame.Rect(300, 250, 200, 50)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if button_rect.collidepoint(event.pos):
                print("버튼 클릭됨")

    screen.fill(WHITE)
    pygame.draw.rect(screen, BLACK, button_rect, 2)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
